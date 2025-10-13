import type { Transaction } from "./transactions"

export function exportToCSV(transactions: Transaction[]) {
  const headers = ["Date", "Title", "Category", "Type", "Amount", "Description"]
  const csvContent = [
    headers.join(","),
    ...transactions.map((t) =>
      [t.date, `"${t.description}"`, t.category, t.type, t.amount, `"${t.description || ""}"`].join(","),
    ),
  ].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", `transactions_${new Date().toISOString().split("T")[0]}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function exportToPDF(transactions: Transaction[]) {
  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0)
  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0)
  const balance = totalIncome - totalExpenses

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Transaction Report</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; }
        h1 { color: #0891b2; }
        .summary { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .summary-item { display: flex; justify-content: space-between; margin: 10px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #0891b2; color: white; }
        .income { color: #10b981; }
        .expense { color: #ef4444; }
      </style>
    </head>
    <body>
      <h1>Transaction Report</h1>
      <p>Generated on ${new Date().toLocaleDateString()}</p>
      
      <div class="summary">
        <h2>Summary</h2>
        <div class="summary-item"><strong>Total Income:</strong> <span class="income">$${totalIncome.toFixed(2)}</span></div>
        <div class="summary-item"><strong>Total Expenses:</strong> <span class="expense">$${totalExpenses.toFixed(2)}</span></div>
        <div class="summary-item"><strong>Balance:</strong> <span>$${balance.toFixed(2)}</span></div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Title</th>
            <th>Category</th>
            <th>Type</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${transactions
            .map(
              (t) => `
            <tr>
              <td>${new Date(t.date).toLocaleDateString()}</td>
              <td>${t.description}</td>
              <td>${t.category}</td>
              <td class="${t.type}">${t.type}</td>
              <td class="${t.type}">$${Number(t.amount).toFixed(2)}</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    </body>
    </html>
  `

  const blob = new Blob([htmlContent], { type: "text/html" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", `transactions_${new Date().toISOString().split("T")[0]}.pdf.html`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function shareViaWhatsApp(transactions: Transaction[]) {
  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0)
  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0)
  const balance = totalIncome - totalExpenses

  const message = `💰 *Money Manager Report*\n\n📊 Summary:\n• Total Income: $${totalIncome.toFixed(2)}\n• Total Expenses: $${totalExpenses.toFixed(2)}\n• Balance: $${balance.toFixed(2)}\n\n📝 Total Transactions: ${transactions.length}\n\nGenerated on ${new Date().toLocaleDateString()}`

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
  window.open(whatsappUrl, "_blank")
}
