import html2pdf from 'html2pdf.js';

export async function exportAuditToPDF(audit, input) {
  // Create a temporary container for PDF content
  const pdfContainer = document.createElement('div');
  pdfContainer.style.cssText = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    max-width: 800px;
    margin: 0 auto;
    padding: 40px;
    background: white;
    color: #1e293b;
    line-height: 1.6;
  `;

  // Header
  const header = document.createElement('div');
  header.style.cssText = `
    text-align: center;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 30px;
    margin-bottom: 30px;
  `;

  const title = document.createElement('h1');
  title.textContent = 'AI Spend Audit Report';
  title.style.cssText = `
    font-size: 28px;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 10px 0;
  `;

  const subtitle = document.createElement('p');
  subtitle.textContent = 'Credex AI Cost Optimization Analysis';
  subtitle.style.cssText = `
    font-size: 16px;
    color: #64748b;
    margin: 0;
  `;

  header.appendChild(title);
  header.appendChild(subtitle);

  // Overview section
  const overview = document.createElement('div');
  overview.style.cssText = `
    margin-bottom: 30px;
    padding: 20px;
    background: #f8fafc;
    border-radius: 8px;
  `;

  const overviewTitle = document.createElement('h2');
  overviewTitle.textContent = 'Audit Overview';
  overviewTitle.style.cssText = `
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 15px 0;
    color: #0f172a;
  `;

  const overviewGrid = document.createElement('div');
  overviewGrid.style.cssText = `
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
  `;

  const metrics = [
    { label: 'Team Size', value: input.teamSize },
    { label: 'Primary Use Case', value: input.primaryUseCase },
    { label: 'Current Monthly Spend', value: `$${audit.totalCurrentMonthly?.toFixed(0) || 0}` },
    { label: 'Optimized Monthly Spend', value: `$${audit.totalOptimizedMonthly?.toFixed(0) || 0}` },
    { label: 'Monthly Savings', value: `$${audit.totalMonthlySavings?.toFixed(0) || 0}` },
    { label: 'Annual Savings', value: `$${audit.totalAnnualSavings?.toFixed(0) || 0}` },
  ];

  metrics.forEach(metric => {
    const metricDiv = document.createElement('div');
    metricDiv.style.cssText = `
      padding: 12px;
      background: white;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
    `;

    const label = document.createElement('div');
    label.textContent = metric.label;
    label.style.cssText = `
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    `;

    const value = document.createElement('div');
    value.textContent = metric.value;
    value.style.cssText = `
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
    `;

    metricDiv.appendChild(label);
    metricDiv.appendChild(value);
    overviewGrid.appendChild(metricDiv);
  });

  overview.appendChild(overviewTitle);
  overview.appendChild(overviewGrid);

  // Summary section
  const summary = document.createElement('div');
  summary.style.cssText = 'margin-bottom: 30px;';

  const summaryTitle = document.createElement('h2');
  summaryTitle.textContent = 'Executive Summary';
  summaryTitle.style.cssText = `
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 15px 0;
    color: #0f172a;
  `;

  const summaryText = document.createElement('p');
  summaryText.textContent = audit.summary || 'No summary available.';
  summaryText.style.cssText = `
    font-size: 14px;
    line-height: 1.6;
    color: #374151;
  `;

  summary.appendChild(summaryTitle);
  summary.appendChild(summaryText);

  // AI Explanation section
  if (audit.aiExplanation?.narrative) {
    const aiSection = document.createElement('div');
    aiSection.style.cssText = 'margin-bottom: 30px;';

    const aiTitle = document.createElement('h2');
    aiTitle.textContent = 'AI Analysis';
    aiTitle.style.cssText = `
      font-size: 20px;
      font-weight: 600;
      margin: 0 0 15px 0;
      color: #0f172a;
    `;

    const aiText = document.createElement('p');
    aiText.textContent = audit.aiExplanation.narrative;
    aiText.style.cssText = `
      font-size: 14px;
      line-height: 1.6;
      color: #374151;
    `;

    aiSection.appendChild(aiTitle);
    aiSection.appendChild(aiText);
    summary.appendChild(aiSection);
  }

  // Tool Analysis section
  const toolsSection = document.createElement('div');
  toolsSection.style.cssText = 'margin-bottom: 30px;';

  const toolsTitle = document.createElement('h2');
  toolsTitle.textContent = 'Tool-by-Tool Analysis';
  toolsTitle.style.cssText = `
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 20px 0;
    color: #0f172a;
  `;

  audit.results?.forEach((result, index) => {
    const toolDiv = document.createElement('div');
    toolDiv.style.cssText = `
      margin-bottom: 25px;
      padding: 20px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    `;

    const toolHeader = document.createElement('div');
    toolHeader.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    `;

    const toolName = document.createElement('h3');
    toolName.textContent = result.toolId;
    toolName.style.cssText = `
      font-size: 18px;
      font-weight: 600;
      color: #0f172a;
      margin: 0;
    `;

    const savingsBadge = document.createElement('div');
    savingsBadge.textContent = `$${result.potentialSavings?.toFixed(0) || 0} saved`;
    savingsBadge.style.cssText = `
      background: #dcfce7;
      color: #166534;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    `;

    toolHeader.appendChild(toolName);
    toolHeader.appendChild(savingsBadge);

    const recommendation = document.createElement('p');
    recommendation.textContent = `Recommendation: ${result.recommendation}`;
    recommendation.style.cssText = `
      font-size: 14px;
      font-weight: 500;
      color: #059669;
      margin: 0 0 10px 0;
    `;

    const calculation = document.createElement('p');
    calculation.textContent = `Savings calculation: ${result.calculation}`;
    calculation.style.cssText = `
      font-size: 13px;
      color: #6b7280;
      margin: 0 0 10px 0;
    `;

    const reason = document.createElement('p');
    reason.textContent = result.reason;
    reason.style.cssText = `
      font-size: 13px;
      color: #374151;
      margin: 0;
    `;

    toolDiv.appendChild(toolHeader);
    toolDiv.appendChild(recommendation);
    toolDiv.appendChild(calculation);
    toolDiv.appendChild(reason);

    toolsSection.appendChild(toolDiv);
  });

  // Footer
  const footer = document.createElement('div');
  footer.style.cssText = `
    text-align: center;
    border-top: 1px solid #e2e8f0;
    padding-top: 20px;
    margin-top: 40px;
    color: #64748b;
    font-size: 12px;
  `;

  footer.textContent = `Generated by Credex AI Audit Tool • ${new Date().toLocaleDateString()}`;

  // Assemble PDF
  pdfContainer.appendChild(header);
  pdfContainer.appendChild(overview);
  pdfContainer.appendChild(summary);
  pdfContainer.appendChild(toolsSection);
  pdfContainer.appendChild(footer);

  // Generate PDF
  const options = {
    margin: 1,
    filename: `credex-ai-audit-${new Date().toISOString().split('T')[0]}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  try {
    await html2pdf().set(options).from(pdfContainer).save();
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw new Error('Failed to generate PDF report');
  } finally {
    // Clean up
    document.body.removeChild(pdfContainer);
  }
}