const { buildSchema } = require('graphql');

const schema = buildSchema(`
  # ── Types ──────────
  type Producto {
    id: ID!
    nombre: String!
    categoria: String!
    stock_actual: Int
    precio: Float!
    movimientos: [Movimiento]
  }

  type Proveedor {
    id: ID!
    nombre: String!
    telefono: String
    ciudad: String
  }

  type Movimiento {
    id: ID!
    producto_id: ID!
    tipo: String!
    cantidad: Int!
    fecha: String!
    observacion: String
  }

  # ── Input ──────────
  input ProductoInput {
    nombre: String!
    categoria: String!
    stock_actual: Int
    precio: Float!
  }

  input ProveedorInput {
    nombre: String!
    telefono: String
    ciudad: String
  }

  input MovimientoInput {
    producto_id: ID!
    tipo: String! # Debe ser 'ENTRADA' o 'SALIDA'
    cantidad: Int!
    fecha: String!
    observacion: String
  }

  # ── Queries ──────────
  type Query {
    productos: [Producto]
    producto(id: ID!): Producto
    movimientos(producto_id: ID!): [Movimiento]
    proveedores: [Proveedor]
    proveedor(id: ID!): Proveedor
  }

  # ── Mutations ──────────
  type Mutation {
    crearProducto(input: ProductoInput!): Producto
    registrarMovimiento(input: MovimientoInput!): Movimiento
    actualizarStock(producto_id: ID!, stock_actual: Int!): Producto
    # Corregido: Es mejor pedir el ID directamente
    eliminarProducto(id: ID!): String
  }
`);

module.exports = schema;