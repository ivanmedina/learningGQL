const graphql = require('graphql')
const { argsToArgsConfig } = require('graphql/type/definition')
const { resolve } = require('path')
const  Course = require('../models/course')
const Teacher = require('../models/teacher')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const auth = require('../utils/auth')

const {GraphQLObjectType, GraphQLInt, GraphQLBoolean,GraphQLID, GraphQLString, GraphQLList, GraphQLSchema} = graphql

const CourseType = new GraphQLObjectType({
    name: 'Course',
    fields: ()=>({
        id: {type: GraphQLID},
        name: {type:GraphQLString},
        language: {type:GraphQLString},
        date: {type: GraphQLString},
        teacher: {
            type: TeacherType,
            resolve(parent, args){
                // return teachers.find(teacher=>teacher.id === parent.teacherId)
                return Teacher.findById(parent.id)
            }
        }
    })
})

const TeacherType = new GraphQLObjectType({
    name: 'Teacher',
    fields: ()=>({
        id: {type: GraphQLID},
        name: {type:GraphQLString},
        age: {type:GraphQLInt},
        active: {type: GraphQLBoolean},
        date: {type: GraphQLString},
        course:{
            type: new GraphQLList(CourseType),
            resolve(parent, args){
                return Course.find({teacherId: parent.id})
                // return courses.filter(course=>course.teacherId === parent.id )
            }
        }
    })
})

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: ()=>({
        id: {type: GraphQLID},
        name: {type:GraphQLString},
        email: {type:GraphQLString},
        password: {type: GraphQLString},
        date: {type: GraphQLString}
    })
})

const MessaggeType = new GraphQLObjectType({
    name: 'Message',
    fields: ()=>({
        message: {type: GraphQLString},
        token: {type: GraphQLString},
        error: {type: GraphQLString}
    })
})

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        course: {
            type: CourseType,
            args: {
                id: {type:  GraphQLID}
            },
            resolve(parent, args, context){
                if(!context.user.auth){
                    throw new Error('Unauthenticated')
                }
                return Course.findById(args.id)
            }
        },
        courses: {
            type: new GraphQLList(CourseType),
            resolve(parent,args){
                // return courses
                return Course.find()
            }
        },
        teacher: {
            type: TeacherType,
            args: {
                name: {type:  GraphQLString}
            },
            resolve(parent, args){
                // return teachers.find(teacher=>teacher.name===args.name)
                return Teacher.findOne({"name": args.name})
            }
        },
        teachers: {
            type: new GraphQLList(TeacherType),
            resolve(parent,args){
                // return teachers
                return Teacher.find()
            }
        },
        user: {
            type: UserType,
            args: {
                email: {type:  GraphQLString}
            },
            resolve(parent, args){
                return users.find(user=>user.email===args.email)
            }
        }
    }
})

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields:{
        addCourse:{
            type: CourseType,
            args:{
                name: {type: GraphQLString},
                language: {type: GraphQLString},
                date: {type: GraphQLString},
                teacherId: {type: GraphQLID}
            },
            resolve(parent, args){
                let course = new Course({
                    name: args.name,
                    language: args.language,
                    date: args.date,
                    teacherId: args.teacherId
                })
                return course.save()
            }
        },
        updateCourse:{
            type: CourseType,
            args:{
                id: {type: GraphQLID},
                name: {type: GraphQLString},
                language: {type: GraphQLString},
                date: {type: GraphQLString},
                teacherId: {type: GraphQLID}
            },
            resolve(parent, args){
                return Course.findByIdAndUpdate(
                    args.id,{
                        name: args.name,
                        language: args.language,
                        date: args.date,
                        teacherId: args.teacherId
                    },
                    {
                        new: true
                    }
                )
            }
        },
        deleteCourse: {
            type: CourseType,
            args:{
                id: {type: GraphQLID}
            },
            resolve(parent, args){
                return Course.findByIdAndDelete(args.id)
            }

        },
        deleteAllCourses: {
            type: CourseType,
            resolve(parent, args){
                return Course.deleteMany({})
            }
        },
        addTeacher:{
            type: TeacherType,
            args:{
                name: {type: GraphQLString},
                active: {type: GraphQLBoolean},
                date: {type: GraphQLString},
                age: {type: GraphQLInt},
            },
            resolve(parent, args){
                return Teacher(args).save()
            }
        },
        updateTeacher:{
            type: TeacherType,
            args: {
                id: {type: GraphQLID},
                name: {type: GraphQLString},
                active: {type: GraphQLBoolean},
                date: {type: GraphQLString},
                age: {type: GraphQLInt},
            },
            resolve(parent,args){
                return Teacher.findByIdAndUpdate(args.id,{
                    name: args.name,
                    age: args.age,
                    active: args.active,
                    date: args.date
                },{
                    new:true
                })
            
            }
        },
        deleteTeacher:{
            type: TeacherType,
            args: {
                id: {type: GraphQLID},
            },
            resolve(parent, args){
                return Teacher.findByIdAndDelete(args.id)
            }
        },
        addUser: {
            type: MessaggeType,
            args:{
                name: {type: GraphQLString},
                email: {type: GraphQLString},
                password: {type: GraphQLString},
                date: {type: GraphQLString},
            },
            async resolve(parent,args){
                let user = await User.findOne({email: args.email})
                if(user) return {error: "El usuario ya existe"}
                const salt = await bcrypt.genSalt(10)
                const hashPassword = await bcrypt.hash(args.password, salt)
                user = new User({
                    name: args.name,
                    email: args.email,
                    date: args.date,
                    password: hashPassword
                })
                user.save()
                return {message: "Usuario registrado con exito"}
            }
        },
        login: {
            type: MessaggeType,
            args: {
                email: {type: GraphQLString},
                password: {type: GraphQLString}
            },
            async resolve(parent,args){
                const result = await auth.login(args.email, args.password, process.env.SECRET_KEY_GRAPHQL_UDEMY)
                return {
                    message: result.message,
                    error: result.error,
                    token: result.token
                } 
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
})