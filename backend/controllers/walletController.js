const { User } = require("../models");

exports.addFunds = async (req, res) => {
  try {
    const { amount } = req.body;
    if (amount <= 0) return res.status(400).json({ error: "Monto inválido" });

    const user = await User.findByPk(req.user.id);
    user.balance += parseFloat(amount);
    await user.save();

    res.json({ message: "Fondos agregados", balance: user.balance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.payWithWallet = async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findByPk(req.user.id);

    if (user.balance < amount) return res.status(400).json({ error: "Saldo insuficiente" });

    user.balance -= parseFloat(amount);
    await user.save();

    res.json({ message: "Pago exitoso", balance: user.balance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
