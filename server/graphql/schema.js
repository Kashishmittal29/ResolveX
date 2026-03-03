/**
 * ==========================================
 * GraphQL Schema - Apollo Server
 * ==========================================
 */

export const typeDefs = `#graphql
  # User Types
  type User {
    id: Int!
    username: String!
    email: String!
    fullName: String
    role: String!
    department: String
    avatar: String
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  # Product Types
  type Product {
    id: Int!
    name: String!
    slug: String
    description: String
    price: Float!
    originalPrice: Float
    stock: Int!
    category: String
    brand: String
    sku: String
    images: [String]
    isActive: Boolean!
    isFeatured: Boolean!
    rating: Float
    reviewCount: Int
    createdAt: String!
    updatedAt: String!
  }

  # Order Types
  type Order {
    id: Int!
    orderNumber: String!
    userId: Int!
    user: User
    status: String!
    subtotal: Float!
    tax: Float!
    shippingCost: Float!
    total: Float!
    shippingAddress: String
    paymentMethod: String
    paymentStatus: String!
    notes: String
    items: [OrderItem]
    createdAt: String!
    updatedAt: String!
  }

  type OrderItem {
    id: Int!
    orderId: Int!
    productId: Int!
    product: Product
    quantity: Int!
    unitPrice: Float!
    totalPrice: Float!
  }

  # Complaint Types
  type Complaint {
    id: Int!
    complaintNumber: String!
    userId: Int!
    user: User
    title: String!
    description: String!
    category: String!
    priority: String!
    status: String!
    location: String
    building: String
    roomNumber: String
    assignedDepartment: String
    rating: Int
    feedback: String
    createdAt: String!
    updatedAt: String!
  }

  # Input Types
  input ProductInput {
    name: String!
    description: String
    price: Float!
    originalPrice: Float
    stock: Int
    category: String
    brand: String
    sku: String
    images: [String]
  }

  input OrderInput {
    userId: Int!
    items: [OrderItemInput!]!
    shippingAddress: String
    paymentMethod: String
    notes: String
  }

  input OrderItemInput {
    productId: Int!
    quantity: Int!
  }

  input ComplaintInput {
    userId: Int!
    title: String!
    description: String!
    category: String!
    priority: String
    location: String
    building: String
    roomNumber: String
  }

  # Queries
  type Query {
    # Users
    users: [User]
    user(id: Int!): User

    # Products
    products(category: String, search: String, featured: Boolean): [Product]
    product(id: Int!): Product
    categories: [String]

    # Orders
    orders(userId: Int, status: String): [Order]
    order(id: Int!): Order

    # Complaints
    complaints(userId: Int, status: String): [Complaint]
    complaint(id: Int!): Complaint
  }

  # Mutations
  type Mutation {
    # Products
    createProduct(input: ProductInput!): Product!
    updateProduct(id: Int!, input: ProductInput!): Product!
    deleteProduct(id: Int!): Boolean!

    # Orders
    createOrder(input: OrderInput!): Order!
    updateOrderStatus(id: Int!, status: String!): Order!

    # Complaints
    createComplaint(input: ComplaintInput!): Complaint!
    updateComplaintStatus(id: Int!, status: String!): Complaint!
    rateComplaint(id: Int!, rating: Int!, feedback: String): Complaint!
  }
`;

