import dotenv from 'dotenv';
import connectDB from './db/db.js'
import {app} from './app.js'

dotenv.config({
    path:'./env'
})


connectDB()
.then( ()=> {
    app.listen(process.env.PORT , ()=> {
        console.log(`server is listening to the port ${process.env.PORT}`)
    })
} )
.catch((error)=>{
    console.log( "mongoDB connection error" , error );
})