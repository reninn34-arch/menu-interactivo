const Joi = require('joi');

const validateProduct = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(1).max(100).required(),
    price: Joi.number().min(0).required(),
    categoryId: Joi.string().max(50).required(),
    description: Joi.string().max(500).optional(),
    enabled: Joi.boolean().optional(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const validateCategory = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(1).max(50).required(),
    description: Joi.string().max(200).optional(),
    icon: Joi.string().max(10).optional(),
    order: Joi.number().min(0).optional(),
    enabled: Joi.boolean().optional(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const validateSiteConfig = (req, res, next) => {
  const schema = Joi.object({
    siteName: Joi.string().min(1).max(100).optional(),
    primaryColor: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
    secondaryColor: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
    backgroundColor: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
    currencySymbol: Joi.string().max(5).optional(),
    deliveryCost: Joi.number().min(0).optional(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

module.exports = {
  validateProduct,
  validateCategory,
  validateSiteConfig,
};