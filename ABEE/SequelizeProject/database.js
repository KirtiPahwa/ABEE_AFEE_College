const { Sequelize, DataTypes } = require('sequelize'); //importing
const mysql=require("mysql");


// configuring the sqlize object
const sequelize = new Sequelize('MySequelizeProject', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
}); 
const database=()=>{
sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
}).catch((error) => {
    console.error('Unable to connect to the database: ', error);
});


//creating table
const objName = sequelize.define("Products",{
    name:{
        type: DataTypes.TEXT,
        allowNull: false
    },
    price:{
        type: DataTypes.INTEGER,
        allowNull: false
    }
})

sequelize.sync().then(() => {
        console.log('table created successfully!');
        objName.create({
            name: "Mango",
            price: 100,
        }).then(res => {
            console.log(res)
        }).catch((error) => {
            console.error('Failed to create a new record : ', error);
        });

    }).catch((error) => {
        console.error('Unable to create table : ', error);
    });
}
module.exports=database;