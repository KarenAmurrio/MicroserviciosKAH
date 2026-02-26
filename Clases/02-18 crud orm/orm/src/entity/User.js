const { Entity, PrimaryGeneratedColumn, Column, EntitySchema } = require("typeorm");

// @Entity("usuarios")
// class Usuario {
//   @PrimaryGeneratedColumn()
//   id;

//   @Column({ length: 100 })
//   nombre;

//   @Column({ length: 150, unique: true })
//   email;

//   @Column({ default: true })
//   activo;
// }


// module.exports = Usuario;
module.exports = new EntitySchema({
  name:'Usuario',
  tableName:'usuarios',

  columns:{
    id:{
      type:Number,
      primary:true,
      generated:true,
    },
    nombre:{
      type:String,
      length:100,
    },
    email:{
      type:String,
      length:150,
      unique:true,
    },
    activo:{
      type:Boolean,
      default:true,
    }
  }

})