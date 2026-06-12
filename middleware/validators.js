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
            // otp:joi.string().pattern(/^\d{6}$/).required().messages({
            //     'any.required': 'OTP is required',
            //     'string.empty': 'OTP cannot be empty',
            //    'string.pattern.base': 'OTP must only contain digits and must be 6 digits'
            // }),
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
            'string.pattern.base': 'NIN must be exactly 11 digits',
            'string.empty': 'NIN cannot be empty',
            'any.required': 'NIN is required'
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
        type: joi.string().valid('deposit', 'withdraw').required().messages({
           'any.required': 'Type is required',
           'string.empty': 'Type cannot be empty',
            'any.only': 'Type must be either deposit or withdraw'
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

