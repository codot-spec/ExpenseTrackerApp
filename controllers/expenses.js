const AWS = require('aws-sdk');

const { Op } = require('sequelize');
const Expense = require('../models/expenses');
const User = require('../models/users')
const DownloadedContent = require('../models/contentloaded');
const sequelize = require('../util/database')

exports.addExpense = async (req, res, next ) => {
  const t = await sequelize.transaction();
  const { amount, description, category } = req.body;
  
  // Check for missing or invalid amount
  if (amount == undefined || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid or missing amount' });
  }

  try {
    const newExpense = await Expense.create(
      { amount, description, category, userId: req.user.id },
      {transaction : t});
    const totalExpense = Number(req.user.totalExpenses) + Number(amount);
   
    await User.update( { totalExpenses: totalExpense} ,
      { where : { id: req.user.id}, transaction: t})
   
     await t.commit();
    res.status(201).json(newExpense);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: 'Error adding expense', error: error.message });
  }
};


exports.updateExpense = async (req, res, next) => {
  const expenseId = req.params.expenseId;
  const { amount, description, category } = req.body;
  const t = await sequelize.transaction();  // Start transaction

  try {
    // Find the expense to get the old amount
    const oldExpense = await Expense.findOne({
      where: { id: expenseId, userId: req.user.id },
      transaction: t
    });

    if (!oldExpense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Update the expense
    await Expense.update(
      { amount, description, category },
      { where: { id: expenseId, userId: req.user.id }, transaction: t }
    );

    // Calculate the new total expense
    const oldTotalExpense = Number(req.user.totalExpenses);
    const newTotalExpense = oldTotalExpense - Number(oldExpense.amount) + Number(amount);

    // Update user's total expenses
    await User.update(
      { totalExpenses: newTotalExpense },
      { where: { id: req.user.id }, transaction: t }
    );

    await t.commit();  // Commit the transaction
    const updatedExpense = await Expense.findOne({
      where: { id: expenseId, userId: req.user.id }
    });

    res.status(200).json(updatedExpense);
  } catch (error) {
    await t.rollback();  // Rollback in case of error
    console.error(error);
    res.status(500).json({ message: 'Error updating expense', error: error.message });
  }
};

exports.deleteExpense = async (req, res, next) => {
  const expenseId = req.params.expenseId;
  const t = await sequelize.transaction();  // Start transaction

  try {
    // Find the expense to get the amount
    const expense = await Expense.findOne({
      where: { id: expenseId, userId: req.user.id },
      transaction: t
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Delete the expense
    await Expense.destroy({
      where: { id: expenseId, userId: req.user.id },
      transaction: t
    });

    // Calculate the new total expense
    const oldTotalExpense = Number(req.user.totalExpenses);
    const newTotalExpense = oldTotalExpense - Number(expense.amount);

    // Update user's total expenses
    await User.update(
      { totalExpenses: newTotalExpense },
      { where: { id: req.user.id }, transaction: t }
    );

    await t.commit();  // Commit the transaction

    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    await t.rollback();  // Rollback in case of error
    console.error(error);
    res.status(500).json({ message: 'Error deleting expense', error: error.message });
  }
};



function uploadToS3(data, filename) {
  const BUCKET_NAME = process.env.BUCKET_NAME;
  const IAM_USER_KEY = process.env.IAM_USER_KEY;
  const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

  const s3bucket = new AWS.S3({
    accessKeyId: IAM_USER_KEY,
    secretAccessKey: IAM_USER_SECRET
  });

  const params = {
    Bucket: BUCKET_NAME,
    Key: filename,  // Ensure filename is passed correctly
    Body: data,     // Body is the file content
    ACL: 'public-read',
    ContentType: 'text/csv'  // You can set the content type according to your file
  };

  return new Promise((resolve, reject) => {
    s3bucket.upload(params, (err, s3response) => {
      if (err) {
        console.log("Something went wrong", err);
        reject(err);
      } else {
        resolve(s3response.Location);  // Return the S3 URL
      }
    });
  });
}

// Log Job Application
exports.logApplication = async (req, res, next) => {
  const t = await sequelize.transaction();
  const { jobTitle, company, status, note, dateApplied } = req.body;
  const imageFile = req.file;  // Assuming multer is being used for file uploads

  try {
    // Validate file type (optional but good practice)
    if (!imageFile || !imageFile.mimetype.startsWith('image/')) {
      return res.status(400).json({ message: 'Invalid file type. Only image files are allowed.' });
    }

    // Generate a unique filename (e.g., using the current timestamp or a UUID)
    const filename = `job-application/${Date.now()}-${imageFile.originalname}`;

    // Upload image to S3
    const uploadedImageUrl = await uploadToS3(imageFile.buffer, filename);

    // Create new application in the database
    const application = await Application.create({
      userId: req.user.id,
      jobTitle,
      company,
      status,
      note,
      dateApplied,
      attachment: uploadedImageUrl
    }, { transaction: t });

    await t.commit();
    res.status(201).json(application); // Respond with the created application
  } catch (error) {
    await t.rollback();
    console.error("Error logging application:", error);
    res.status(500).json({ message: 'Error logging application', error });
  }
};



exports.downloadExpense = async (req, res, next) => {
  try{
    const expenses = await req.user.getExpenses();
  //console.log(expenses);
  const stringifiedExpenses = JSON.stringify(expenses);
  const userId = req.user.id;
 const filename = `Expense${userId}/${new Date()}.txt` ;
 const fileUrl = await uploadToS3(stringifiedExpenses, filename,'text/plain');
 
 await DownloadedContent.create({
  userId: userId,
  url: fileUrl,
  filename: filename,
});

 res.status(200).json({fileUrl, success: true});
}
catch(err){
  console.log(err)
  res.status(500).json({fileUrl: '',success: false, err: err})
}
}

exports.getDownloadedContent = async (req, res, next) => {
  try {
    const downloadedContents = await DownloadedContent.findAll({
      where: { userId: req.user.id },
    });

    res.status(200).json(downloadedContents);  // Return the list of downloaded content URLs
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching downloaded content', error: err.message });
  }
};


// Fetch expenses with pagination
exports.getExpenses = async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1; // Default to page 1 if not provided
const limit = parseInt(req.query.limit, 10) || 2; // Default to limit 2 if not provided
  try {
    const offset = (page - 1) * limit;
    const { count, rows } = await Expense.findAndCountAll({
      where: { userId: req.user.id },
      limit: limit,
      offset: offset
    });

    // Calculate total pages
    const totalPages = Math.ceil(count / limit);

    res.status(200).json({ 
      expenses: rows, 
      pagination: {
        totalItems: count,
        totalPages: totalPages,
        currentPage: page,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching expenses', error: error.message });
  }
};

// Fetch expenses by date range with pagination
exports.getExpensesByDateRange = async (req, res, next) => {
  const { range, page = 1, limit = 2 } = req.query;
  // Ensure `page` and `limit` are integers, defaulting if invalid
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  const t = await sequelize.transaction();
  const userId = req.user.id;

  try {
    let dateCondition;
    const today = new Date();
    
    if (range === 'daily') {
      dateCondition = {
        createdAt: {
          [Op.gte]: new Date(today.setHours(0, 0, 0, 0)),
          [Op.lte]: new Date(today.setHours(23, 59, 59, 999))
        }
      };
    } else if (range === 'weekly') {
      const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
      dateCondition = {
        createdAt: {
          [Op.gte]: weekStart,
          [Op.lte]: new Date()
        }
      };
    } else if (range === 'monthly') {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      dateCondition = {
        createdAt: {
          [Op.gte]: monthStart,
          [Op.lte]: new Date()
        }
      };
    } else {
      return res.status(400).json({ message: 'Invalid date range' });
    }

    const offset = (pageNumber - 1) * limitNumber;
    const { count, rows } = await Expense.findAndCountAll({
      where: {
        userId,
        ...dateCondition
      },
      limit: limitNumber,
      offset: offset,
      transaction: t,
    });

    const totalPages = Math.ceil(count / limitNumber);

    await t.commit();
    
    res.status(200).json({
      expenses: rows,
      pagination: {
        totalItems: count,
        totalPages: totalPages,
        currentPage: pageNumber,
        itemsPerPage: limitNumber
      }
    });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({ message: 'Error fetching expenses', error: error.message });
  }
};
