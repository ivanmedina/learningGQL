const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema({
    name: String,
    language: String,
    date: String,
    teacherId: String
})

const Course = new mongoose.model('course',courseSchema)

module.exports = Course