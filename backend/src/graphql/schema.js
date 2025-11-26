const {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLID,
  GraphQLInt,
  GraphQLFloat,
  GraphQLList,
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLBoolean,
  GraphQLNonNull,
} = require("graphql");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Employee = require("../models/Employee");

// ---------- Helper: RBAC ----------

function requireAuth(context) {
  if (!context.user) {
    throw new Error("Not authenticated");
  }
}

function requireRole(context, roles) {
  requireAuth(context);
  if (!roles.includes(context.user.role)) {
    throw new Error("Not authorized");
  }
}

// ---------- GraphQL Types ----------

const RoleEnum = new GraphQLEnumType({
  name: "Role",
  values: {
    ADMIN: { value: "ADMIN" },
    EMPLOYEE: { value: "EMPLOYEE" },
  },
});

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    role: { type: new GraphQLNonNull(RoleEnum) },
  }),
});

const EmployeeType = new GraphQLObjectType({
  name: "Employee",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    age: { type: GraphQLInt },
    class: { type: GraphQLString },
    subjects: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
    },
    attendance: { type: GraphQLFloat },
    email: { type: GraphQLString },
    phone: { type: GraphQLString },
    department: { type: GraphQLString },
    flagged: { type: GraphQLBoolean },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  }),
});

const AuthPayloadType = new GraphQLObjectType({
  name: "AuthPayload",
  fields: () => ({
    token: { type: new GraphQLNonNull(GraphQLString) },
    user: { type: new GraphQLNonNull(UserType) },
  }),
});

const EmployeePageType = new GraphQLObjectType({
  name: "EmployeePage",
  fields: () => ({
    items: {
      type: new GraphQLNonNull(
        new GraphQLList(new GraphQLNonNull(EmployeeType))
      ),
    },
    totalCount: { type: new GraphQLNonNull(GraphQLInt) },
    page: { type: new GraphQLNonNull(GraphQLInt) },
    pageSize: { type: new GraphQLNonNull(GraphQLInt) },
  }),
});

const SortOrderEnum = new GraphQLEnumType({
  name: "SortOrder",
  values: {
    ASC: { value: "ASC" },
    DESC: { value: "DESC" },
  },
});

const EmployeeSortFieldEnum = new GraphQLEnumType({
  name: "EmployeeSortField",
  values: {
    NAME: { value: "NAME" },
    AGE: { value: "AGE" },
    ATTENDANCE: { value: "ATTENDANCE" },
    CREATED_AT: { value: "CREATED_AT" },
  },
});

const EmployeeFilterInput = new GraphQLInputObjectType({
  name: "EmployeeFilter",
  fields: {
    name: { type: GraphQLString },
    class: { type: GraphQLString },
    department: { type: GraphQLString },
    minAge: { type: GraphQLInt },
    maxAge: { type: GraphQLInt },
    minAttendance: { type: GraphQLFloat },
    maxAttendance: { type: GraphQLFloat },
  },
});

const AddEmployeeInput = new GraphQLInputObjectType({
  name: "AddEmployeeInput",
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    age: { type: GraphQLInt },
    class: { type: GraphQLString },
    subjects: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
    },
    attendance: { type: GraphQLFloat },
    email: { type: GraphQLString },
    phone: { type: GraphQLString },
    department: { type: GraphQLString },
  },
});

const UpdateEmployeeInput = new GraphQLInputObjectType({
  name: "UpdateEmployeeInput",
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: GraphQLString },
    age: { type: GraphQLInt },
    class: { type: GraphQLString },
    subjects: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
    },
    attendance: { type: GraphQLFloat },
    email: { type: GraphQLString },
    phone: { type: GraphQLString },
    department: { type: GraphQLString },
    flagged: { type: GraphQLBoolean },
  },
});

// ---------- Helper: filter & sort builders ----------

function buildEmployeeQuery(filter) {
  const query = {};
  if (!filter) return query;

  if (filter.name) {
    query.name = { $regex: filter.name, $options: "i" };
  }
  if (filter.class) {
    query.class = filter.class;
  }
  if (filter.department) {
    query.department = filter.department;
  }
  if (filter.minAge != null || filter.maxAge != null) {
    query.age = {};
    if (filter.minAge != null) query.age.$gte = filter.minAge;
    if (filter.maxAge != null) query.age.$lte = filter.maxAge;
  }
  if (filter.minAttendance != null || filter.maxAttendance != null) {
    query.attendance = {};
    if (filter.minAttendance != null)
      query.attendance.$gte = filter.minAttendance;
    if (filter.maxAttendance != null)
      query.attendance.$lte = filter.maxAttendance;
  }

  return query;
}

function buildSort(sortBy, sortOrder) {
  const order = sortOrder === "DESC" ? -1 : 1;
  if (!sortBy) return { createdAt: -1 };

  switch (sortBy) {
    case "NAME":
      return { name: order };
    case "AGE":
      return { age: order };
    case "ATTENDANCE":
      return { attendance: order };
    case "CREATED_AT":
      return { createdAt: order };
    default:
      return { createdAt: -1 };
  }
}

// ---------- Root Query ----------

const QueryType = new GraphQLObjectType({
  name: "Query",
  fields: () => ({
    me: {
      type: UserType,
      resolve: (parent, args, context) => {
        if (!context.user) return null;
        return User.findById(context.user.id);
      },
    },

    employees: {
      type: new GraphQLNonNull(
        new GraphQLList(new GraphQLNonNull(EmployeeType))
      ),
      args: {
        filter: { type: EmployeeFilterInput },
        sortBy: { type: EmployeeSortFieldEnum },
        sortOrder: { type: SortOrderEnum },
      },
      resolve: async (parent, { filter, sortBy, sortOrder }, context) => {
        requireAuth(context);
        const query = buildEmployeeQuery(filter);
        const sort = buildSort(sortBy, sortOrder);
        return Employee.find(query).sort(sort);
      },
    },

    employee: {
      type: EmployeeType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: (parent, { id }, context) => {
        requireAuth(context);
        return Employee.findById(id);
      },
    },

    employeesPaginated: {
      type: new GraphQLNonNull(EmployeePageType),
      args: {
        filter: { type: EmployeeFilterInput },
        sortBy: { type: EmployeeSortFieldEnum },
        sortOrder: { type: SortOrderEnum },
        page: { type: GraphQLInt, defaultValue: 1 },
        pageSize: { type: GraphQLInt, defaultValue: 10 },
      },
      resolve: async (
        parent,
        { filter, sortBy, sortOrder, page, pageSize },
        context
      ) => {
        requireAuth(context);
        const query = buildEmployeeQuery(filter);
        const sort = buildSort(sortBy, sortOrder);

        const skip = (page - 1) * pageSize;

        const [items, totalCount] = await Promise.all([
          Employee.find(query).sort(sort).skip(skip).limit(pageSize),
          Employee.countDocuments(query),
        ]);

        return {
          items,
          totalCount,
          page,
          pageSize,
        };
      },
    },
  }),
});

// ---------- Root Mutation ----------

const MutationType = new GraphQLObjectType({
  name: "Mutation",
  fields: () => ({
    register: {
      type: new GraphQLNonNull(AuthPayloadType),
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
        role: { type: RoleEnum },
      },
      resolve: async (parent, { name, email, password, role }) => {
        const existing = await User.findOne({ email });
        if (existing) {
          throw new Error("User with this email already exists");
        }

        const user = new User({
          name,
          email,
          password,
          role: role || "EMPLOYEE",
        });

        await user.save();

        const token = jwt.sign(
          {
            userId: user.id,
            role: user.role,
            email: user.email,
          },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );

        return { token, user };
      },
    },

    login: {
      type: new GraphQLNonNull(AuthPayloadType),
      args: {
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, { email, password }) => {
        const user = await User.findOne({ email });
        if (!user) throw new Error("Invalid credentials");

        const ok = await user.comparePassword(password);
        if (!ok) throw new Error("Invalid credentials");

        const token = jwt.sign(
          {
            userId: user.id,
            role: user.role,
            email: user.email,
          },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );

        return { token, user };
      },
    },

    addEmployee: {
      type: new GraphQLNonNull(EmployeeType),
      args: {
        input: { type: new GraphQLNonNull(AddEmployeeInput) },
      },
      resolve: async (parent, { input }, context) => {
        requireRole(context, ["ADMIN"]);
        const employee = new Employee(input);
        return employee.save();
      },
    },

    updateEmployee: {
      type: new GraphQLNonNull(EmployeeType),
      args: {
        input: { type: new GraphQLNonNull(UpdateEmployeeInput) },
      },
      resolve: async (parent, { input }, context) => {
        requireRole(context, ["ADMIN"]);
        const { id, ...update } = input;
        const emp = await Employee.findByIdAndUpdate(id, update, {
          new: true,
        });
        if (!emp) throw new Error("Employee not found");
        return emp;
      },
    },
    
    deleteEmployee: {
      type: new GraphQLNonNull(GraphQLBoolean),
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (parent, { id }, context) => {
        requireRole(context, ["ADMIN"]);
        const deleted = await Employee.findByIdAndDelete(id);
        return !!deleted;
      },
    },
  }),
});

// ---------- Export schema ----------

const schema = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType,
});

module.exports = schema;
