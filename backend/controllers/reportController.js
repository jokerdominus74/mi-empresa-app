const { Transaction } = require("../models");
const { Op } = require("sequelize");
const ExcelJS = require("exceljs");

// Obtener reporte financiero en JSON
exports.getFinancialReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Fechas de inicio y fin requeridas" });
    }

    const transactions = await Transaction.findAll({
      where: {
        timestamp: {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        },
      },
    });

    const totalDeposits = transactions
      .filter((t) => t.type === "deposit")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalPayments = transactions
      .filter((t) => t.type === "payment")
      .reduce((sum, t) => sum + t.amount, 0);

    res.json({ totalDeposits, totalPayments, transactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Exportar reporte financiero a Excel
exports.exportFinancialReportExcel = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Fechas de inicio y fin requeridas" });
    }

    const transactions = await Transaction.findAll({
      where: {
        timestamp: {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        },
      },
      order: [["timestamp", "DESC"]],
    });

    // Crear un nuevo libro y una hoja de cálculo
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Financial Report");

    // Definir columnas del Excel
    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Tipo", key: "type", width: 15 },
      { header: "Monto", key: "amount", width: 15 },
      { header: "Estado", key: "status", width: 15 },
      { header: "Fecha", key: "timestamp", width: 20 },
    ];

    // Agregar filas de datos
    transactions.forEach((t) => {
      worksheet.addRow({
        id: t.id,
        type: t.type,
        amount: t.amount,
        status: t.status,
        timestamp: t.timestamp.toISOString(), // Convertir a formato legible
      });
    });

    // Configurar la respuesta HTTP para descarga de archivo
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Financial_Report_${startDate}_to_${endDate}.xlsx`
    );

    // Escribir el archivo en la respuesta
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
