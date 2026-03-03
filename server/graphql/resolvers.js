/**
 * ==========================================
 * GraphQL Resolvers - Apollo Server
 * ==========================================
 */

import { Op } from 'sequelize';
import { User, Product, Order, OrderItem, Complaint } from '../models/index.js';

export const resolvers = {
  // Query Resolvers
  Query: {
    // Users
    users: async () => await User.findAll(),
    user: async (_, { id }) => await User.findByPk(id),

    // Products
    products: async (_, { category, search, featured }) => {
      const where = { isActive: true };
      if (category) where.category = category;
      if (featured) where.isFeatured = featured;
      if (search) {
        where.name = { [Op.like]: `%${search}%` };
      }
      return await Product.findAll({ where });
    },
    product: async (_, { id }) => await Product.findByPk(id),
    categories: async () => {
      const products = await Product.findAll({
        attributes: ['category'],
        where: { isActive: true },
        group: ['category']
      });
      return products.map(p => p.category).filter(Boolean);
    },

    // Orders
    orders: async (_, { userId, status }) => {
      const where = {};
      if (userId) where.userId = userId;
      if (status) where.status = status;
      return await Order.findAll({
        where,
        include: [
          { model: User, as: 'user', attributes: ['id', 'username', 'email', 'fullName'] },
          { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }
        ],
        order: [['createdAt', 'DESC']]
      });
    },
    order: async (_, { id }) => await Order.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'email', 'fullName'] },
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }
      ]
    }),

    // Complaints
    complaints: async (_, { userId, status }) => {
      const where = {};
      if (userId) where.userId = userId;
      if (status) where.status = status;
      return await Complaint.findAll({
        where,
        include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email', 'fullName'] }],
        order: [['createdAt', 'DESC']]
      });
    },
    complaint: async (_, { id }) => await Complaint.findByPk(id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email', 'fullName'] }]
    })
  },

  // Mutation Resolvers
  Mutation: {
    // Products
    createProduct: async (_, { input }) => {
      return await Product.create(input);
    },
    updateProduct: async (_, { id, input }) => {
      const product = await Product.findByPk(id);
      if (!product) throw new Error('Product not found');
      await product.update(input);
      return product;
    },
    deleteProduct: async (_, { id }) => {
      const product = await Product.findByPk(id);
      if (!product) throw new Error('Product not found');
      await product.update({ isActive: false });
      return true;
    },

    // Orders
    createOrder: async (_, { input }) => {
      const { userId, items, shippingAddress, paymentMethod, notes } = input;
      
      // Calculate totals
      let subtotal = 0;
      const orderItemsData = [];

      for (const item of items) {
        const product = await Product.findByPk(item.productId);
        if (!product) throw new Error(`Product ${item.productId} not found`);
        
        const itemTotal = product.price * item.quantity;
        subtotal += itemTotal;
        
        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice: product.price,
          totalPrice: itemTotal
        });
      }

      const tax = subtotal * 0.1;
      const shippingCost = subtotal > 100 ? 0 : 10;
      const total = subtotal + tax + shippingCost;

      const order = await Order.create({
        userId,
        subtotal,
        tax,
        shippingCost,
        total,
        shippingAddress,
        paymentMethod,
        notes
      });

      for (const item of orderItemsData) {
        await OrderItem.create({ ...item, orderId: order.id });
      }

      return await Order.findByPk(order.id, {
        include: [
          { model: User, as: 'user' },
          { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }
        ]
      });
    },
    updateOrderStatus: async (_, { id, status }) => {
      const order = await Order.findByPk(id);
      if (!order) throw new Error('Order not found');
      
      const updateData = { status };
      if (status === 'shipped') updateData.shippedAt = new Date();
      if (status === 'delivered') updateData.deliveredAt = new Date();
      
      await order.update(updateData);
      return order;
    },

    // Complaints
    createComplaint: async (_, { input }) => {
      const { priority = 'medium' } = input;
      return await Complaint.create({ ...input, priority });
    },
    updateComplaintStatus: async (_, { id, status }) => {
      const complaint = await Complaint.findByPk(id);
      if (!complaint) throw new Error('Complaint not found');
      
      const updateData = { status };
      if (status === 'resolved') updateData.resolvedAt = new Date();
      if (status === 'closed') updateData.closedAt = new Date();
      
      await complaint.update(updateData);
      return complaint;
    },
    rateComplaint: async (_, { id, rating, feedback }) => {
      const complaint = await Complaint.findByPk(id);
      if (!complaint) throw new Error('Complaint not found');
      
      await complaint.update({ rating, feedback });
      return complaint;
    }
  },

  // Field Resolvers
  Order: {
    user: async (order) => await User.findByPk(order.userId),
    items: async (order) => await OrderItem.findAll({ where: { orderId: order.id } })
  },
  
  OrderItem: {
    product: async (item) => await Product.findByPk(item.productId)
  },
  
  Complaint: {
    user: async (complaint) => await User.findByPk(complaint.userId)
  }
};

