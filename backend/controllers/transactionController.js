const { Transaction } = require("../models");

exports.getTransactionHistory = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: { userId: req.user.id },
      order: [["timestamp", "DESC"]],
    });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
