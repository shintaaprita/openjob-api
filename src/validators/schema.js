const Joi = require('joi');

const registerSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  password: Joi.string().min(6).required(),
  fullname: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required()
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

const companySchema = Joi.object({
  name: Joi.string().max(100).required(),
  description: Joi.string().allow('', null),
  location: Joi.string().allow('', null)
});

const categorySchema = Joi.object({
  name: Joi.string().max(100).required()
});

const jobSchema = Joi.object({
  title: Joi.string().max(100).required(),
  description: Joi.string().required(),
  company_id: Joi.string().required(),
  category_id: Joi.string().required()
});

module.exports = { 
  registerSchema, 
  loginSchema,
  companySchema,
  categorySchema,
  jobSchema
};