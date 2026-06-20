const joi = require('joi')

exports.signUpValidator = (req, res, next)=>{
    const schema = joi.object({
        firstName: joi.string().trim().pattern(/^[A-Za-z]{2,}$/).required().messages({
            'any.required': 'FirstName is required',
            'string.empty':'FirstName cannot be Empty',
            'string.pattern.base': 'FirstName cannot contain numbers, spaces and must be atleast 2 characters'
		}),
        lastName: joi.string().trim().pattern(/^[A-Za-z]{2,}$/).required().messages({
            'any.required': 'LastName is required',
            'string.empty':'LastName cannot be Empty',
            'string.pattern.base': 'LastName cannot contain numbers, spaces and must be atleast 2 characters'
		}),
        email:joi.string().email().required().messages({
						'any required':'Email is required',
						'string.empty':'Email cannot be Empty',
						'string.email':'Email must be a valid email',
		}),
	   phoneNumber: joi.string().pattern(/^\d{11}$/).required().messages({
						'any required':'Phone number is required',
						'string.empty':'Phone number cannot be empty',
						'string.pattern.base':'Phone number must contain only 11 digits'
		}),
		password:joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z]).{8,}$/).required().messages({
						'any required':'Password is required',
						'string.empty':'Password cannot be Empty',
						'string.pattern.base':'Password must be 8 chracters must include upper and lower case'
		})
			})
			const {error}= schema.validate(req.body)
			if(error) {
				return res.status(400).json({
					message:error.details[0].message
				})
			}
			 next()
		}

exports.resetPasswordValidator = async (req, res, next)=>{
    const schema = joi.object({
         email:joi.string().email().required().messages({
            'any.required': 'Email is required',
            'string.empty': 'Email cannot be empty',
            'string.email': 'Email must be a valid email'
            }),
            otp:joi.string().pattern(/^\d{6}$/).required().messages({
                'any.required': 'OTP is required',
                'string.empty': 'OTP cannot be empty',
               'string.pattern.base': 'OTP must only contain digits and must be 6 digits'
            }),
            newPassword: joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z]).{8,}$/).required().messages({
                'any.required': 'Password is required',
                'string.empty': 'Password cannot be empty',
               'string.pattern.base': 'Password must be at least 8 characters and must Include 1 uppercase and 1 lowercase'
            }),
            confirmPassword:joi.string().required().valid(joi.ref('newPassword')).messages({
                'any.only':'Confirm password must match password',
                'any.required':'Confirm password is required'
            })
    })
    const { error } = schema.validate(req.body);

    // console.log(error.details)
    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        });
    }
    next();
}
exports.changePasswordValidator = (req,res,next)=>{
    const schema = joi.object({
        oldPassword:joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z]).{8,}$/).messages({
            'any.required': 'Old password is required',
            'string.empty': 'Old Password cannot be empty',
            'string.pattern.base': 'Old Password must be at least 8 characters and must Include 1 uppercase and 1 lowercase'
        }),
        newPassword: joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z]).{8,}$/).required().messages({
            'any.required': 'new Password is required',
            'string.empty': 'new Password cannot be empty',
            'string.pattern.base': 'new Password must be at least 8 characters and must Include 1 uppercase and 1 lowercase'
        }),
        confirmPassword:joi.string().required().valid(joi.ref('newPassword')).messages({
                'any.only':'Confirm password must match new password',
                'any.required':'Confirm password is required'
            }),
    })
    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        });
    }
    next();
}
exports.changeTransactionPinValidator = (req,res,next)=>{
    const schema = joi.object({
    oldTransactionPin:joi.string().pattern(/^\d{6}$/).messages({
            'any.required': 'Old pin is required',
            'string.empty': 'Old Pin cannot be empty',
        'string.pattern.base': 'Old Pin must be at least 6 characters and must Include only digits'
    }),
    newTransactionPin:joi.string().pattern(/^\d{6}$/).messages({
            'any.required': 'New pin is required',
            'string.empty': 'New Pin cannot be empty',
            'string.pattern.base': 'New Pin must be at least 6 characters and must Include only digits'
    }),
    confirmTransactionPin:joi.string().required().valid(joi.ref('newTransactionPin')).messages({
            'any.only':'Confirm pin must match new pin',
            'any.required':'Confirm pin is required'
        }),
    })
    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        });
    }
    next();
}
exports.createTransactionPinValidator = (req,res,next)=>{
    const schema = joi.object({
			email:joi.string().email().required().messages({
            'any.required': 'Email is required',
            'string.empty': 'Email cannot be empty',
            'string.email': 'Email must be a valid email'
            }),
        transactionPin:joi.string().pattern(/^\d{6}$/).messages({
                'any.required': 'New pin is required',
                'string.empty': 'New Pin cannot be empty',
               'string.pattern.base': 'New Pin must be at least 6 characters and must Include only digits'
        }),
        confirmTransactionPin:joi.string().required().valid(joi.ref('transactionPin')).messages({
                'any.only':'Confirm pin must match new pin',
                'any.required':'Confirm pin is required'
        }),
    })
    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        });
    }
    next();
}
exports.kycValidator = (req, res, next) => {
    const schema = joi.object({
        id: joi.string().pattern(/^\d{11}$/).required().messages({
            'string.pattern.base': 'ID number must be exactly 11 digits',
            'string.empty': 'ID number cannot be empty',
            'any.required': 'ID number is required'
        })
    })
     const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        });
    }
    next();
}
exports.bankDetailsValidator = (req, res, next) => {
    const schema = joi.object({
        accountNumber: joi.string() .pattern(/^\d{10}$/) .required() .messages({
            'string.pattern.base': 'Account number must be exactly 10 digits',
            'string.empty': 'Account number cannot be empty',
            'any.required': 'Account number is required'
       }),
        bankName: joi.string() .required().messages({
            'string.empty': 'Bank name is required',
            'any.required': 'Bank name is required'
       }),
       accountName: joi.string().required().messages({
            'string.empty': 'Account name is required',
             'any.required': 'Account name is required'
        }),
  });
    const { error } = schema.validate(req.body);

    if (error) {
    return res.status(400).json({
        message: error.details[0].message
    });
}
    next();
}
exports.resendOtpValidator = (req, res, next) => {
    const schema = joi.object({
        email: joi.string().email() .required().messages({
            'string.email': 'Please enter a valid email address',
            'string.empty': 'Email cannot be empty',
            'any.required': 'Email is required'
       }) 
    
   })
    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        });
    }
    next();
}

exports.updateValidator = (req,res,next)=>{
    const schema = joi.object({
        phoneNumber: joi.string().pattern(/^\d{11}$/).required().messages({
			'any required':'Phone number is required',
			'string.empty':'Phone number cannot be empty',
			'string.pattern.base':'Phone number must contain only 11 digits'
		}),
    })
    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        });
    }
    next();
}
    
exports.initiatePaymentValidator = (req, res, next) => {
    const schema = joi.object({
        amount: joi.number().integer().min(1500).required().messages({
            "number.base": "Amount must be a number",
            "number.integer": "Amount must be a whole Naira value",
            "number.min": "Minimum deposit amount is ₦1500",
            "any.required": "Amount is required"
        }),
    })
    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        });
    }
    next();
}
exports.conversionValidator = (req, res, next) => {
    const schema = joi.object({
        from: joi.string().valid('NGN', 'USDT').required(),
        to: joi.string().valid('NGN', 'USDT').required(),
        amount: joi.number().required().when('from', {is: 'NGN',
            then: joi.number().min(1500).messages({
                    'number.min': 'Minimum NGN conversion amount is ₦1500'
                }),
                otherwise: joi.number().min(1.30).messages({
                    'number.min': 'Minimum USDT conversion amount is 1.30 USDT'
                })
            }).messages({
                'number.base': 'Amount must be a number',
                'any.required': 'Amount is required'
            })
        });
        const { error } = schema.validate(req.body);
        
        if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    }

    next();
};
exports.createPlanValidator = (req, res, next) => {
  const schema = joi.object({
    title: joi.string().required().messages({
      "string.base": "Title must be a string",
      "any.required": "Title is required",
    }),

    targetAmount: joi.number().min(100).required().messages({
      "number.base": "Target amount must be a number",
      "number.min": "Target amount must be greater than 100",
      "any.required": "Target amount is required",
    }),

    planType: joi.string().valid("FLEXIBLE", "LOCKED", "STEALTH").required().messages({
      "string.base": "Plan type must be a string",
      "any.only": "Plan type must be one of FLEXIBLE, LOCKED, or STEALTH",
      "any.required": "Plan type is required",
    }),

    duration: joi.when("planType", {
      is: joi.string().valid("LOCKED", "STEALTH"),
      then: joi.number().min(1).required().messages({
        "number.base": "Duration must be a number",
        "number.min": "Duration must be at least 1 day",
        "any.required": "Duration is required for LOCKED and STEALTH plans",
      }),
    
    }),

    savingFrequency: joi.when("planType", {
        is: joi.string().valid("FLEXIBLE"),
        then: joi.string().valid("DAILY", "WEEKLY", "MONTHLY").required().messages({
                "string.base": "Saving frequency must be a string",
                "any.only": "Saving frequency must be one of DAILY, WEEKLY, or MONTHLY",
                "any.required": "Saving frequency is required for FLEXIBLE plans",
   }),
}),
    amountPerFrequency: joi.number().min(100).required().messages({
      "number.base": "Amount per frequency must be a number",
      "number.min": "Amount per frequency must be greater than 100",
      "any.required": "Amount per frequency is required",
    }),

    transactionPin:joi.string().pattern(/^\d{6}$/).messages({
      'any.required': 'New pin is required',
      'string.empty': 'New Pin cannot be empty',
      'string.pattern.base': 'New Pin must be at least 6 characters and must Include only digits'
    }),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  next();
};

exports.createInvestmentValidator = (req, res, next) => {
    const schema = joi.object({
        investmentPlanId: joi.string().hex().length(24).required().messages({
            "string.base": "Investment Plan ID must be a string",
            "string.hex": "Invalid Investment Plan ID",
            "string.length": "Invalid Investment Plan ID",
            "any.required": "Investment Plan ID is required"
        }),

        amount: joi.number().integer().required().messages({
            "number.base": "Amount must be a number",
            "number.integer": "Amount must be a whole Naira value",
            "any.required": "Amount is required"
        })
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details[0].message
        });
    }

    next();
};

exports.compInvestmentValidator = (req, res, next) => {
    const schema = joi.object({
        userId: joi.string().hex().length(24).required().messages({
            "string.base": "user ID must be a string",
            "string.hex": "Invalid user ID",
            "string.length": "Invalid user ID",
            "any.required": "user ID is required"
        }),
        investmentId: joi.string().hex().length(24).required().messages({
            "string.base": "investment ID must be a string",
            "string.hex": "Invalid investment ID",
            "string.length": "Invalid investment ID",
            "any.required": "investment ID is required"
        }),
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details[0].message
        });
    }

    next();
};

exports.claimInvestmentValidator = (req, res, next) => {
    const schema = joi.object({
        userId: joi.string().hex().length(24).required().messages({
            "string.base": "user ID must be a string",
            "string.hex": "Invalid user ID",
            "string.length": "Invalid user ID",
            "any.required": "user ID is required"
        }),
        investmentId: joi.string().hex().length(24).required().messages({
            "string.base": "investment ID must be a string",
            "string.hex": "Invalid investment ID",
            "string.length": "Invalid investment ID",
            "any.required": "investment ID is required"
        }),
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details[0].message
        });
    }

    next();
};

exports.confirmTransactionPinValidator = (req,res,next)=>{
    const schema = joi.object({
        enteredPin:joi.string().pattern(/^\d{6}$/).messages({
            'any.required': 'Entered pin is required',
            'string.empty': 'Entered pin cannot be empty',
            'string.pattern.base': 'Entered Pin must be at least 6 characters and must Include only digits'
        }),
    })
    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        });
    }
    next();
}

exports.breakInvestmentValidator = (req, res, next) => {
    const schema = joi.object({
        investmentId: joi.string().hex().length(24).required().messages({
            "string.base": "investment ID must be a string",
            "string.hex": "Invalid investment ID",
            "string.length": "Invalid investment ID",
            "any.required": "investment ID is required"
        }),
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details[0].message
        });
    }

    next();
};
exports.resetTransactionPinValidator = (req, res, next) => {
    const schema = joi.object({
        email: joi.string().email().required().messages({
            'any.required': 'Email is required',
            'string.empty': 'Email cannot be empty',
            'string.email': 'Please provide a valid email address'
        }),
        otp: joi.string().pattern(/^\d{6}$/).required().messages({
            'any.required': 'OTP is required',
            'string.empty': 'OTP cannot be empty',
            'string.pattern.base': 'OTP must be 6 digits'
        }),
        newPin: joi.string().pattern(/^\d{6}$/).required().messages({
            'any.required': 'New pin is required',
            'string.empty': 'New pin cannot be empty',
            'string.pattern.base': 'New Pin must be exactly 6 digits and must include only digits'
        }),
    })
    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        });
    }
    next();
}
exports.createPlanValidator = (req, res, next) => {
    const schema = joi.object({
        title: joi.string().trim().min(3).max(100).required().messages({
            'any.required': 'Title is required',
            'string.empty': 'Title cannot be empty',
            'string.min': 'Title must be at least 3 characters',
            'string.max': 'Title cannot exceed 100 characters'
        }),
        targetAmount: joi.number().positive().required().messages({
            'any.required': 'Target amount is required',
            'number.base': 'Target amount must be a number',
            'number.positive': 'Target amount must be greater than 0'
        }),
        planType: joi.string().valid('FIXED', 'FLEXIBLE', 'TARGET').required().messages({
            'any.required': 'Plan type is required',
            'any.only': 'Plan type must be one of FIXED, FLEXIBLE, or TARGET'
        }),
        duration: joi.number().integer().positive().required().messages({
            'any.required': 'Duration is required',
            'number.base': 'Duration must be a number',
            'number.positive': 'Duration must be greater than 0'
        }),
        savingFrequency: joi.string().valid('DAILY', 'WEEKLY', 'MONTHLY').required().messages({
            'any.required': 'Saving frequency is required',
            'any.only': 'Saving frequency must be DAILY, WEEKLY, or MONTHLY'
        }),
        amountPerFrequency: joi.number().positive().required().messages({
            'any.required': 'Amount per frequency is required',
            'number.base': 'Amount per frequency must be a number',
            'number.positive': 'Amount per frequency must be greater than 0'
        }),
        transactionPin: joi.string().pattern(/^\d{6}$/).required().messages({
            'any.required': 'Transaction pin is required',
            'string.empty': 'Transaction pin cannot be empty',
            'string.pattern.base': 'Transaction pin must be exactly 6 digits and must include only digits'
        }),
    })
    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        });
    }
    next();
}
