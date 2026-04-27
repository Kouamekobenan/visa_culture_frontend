import { AdminEventDTO } from '../../module/domain/entities/admin-event.dto';

export const generateEventSummaryPDF = (data: AdminEventDTO) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const dateGenere = new Date().toLocaleString('fr-FR');
  const eventDate = new Date(data.event.date).toLocaleDateString('fr-FR');
  printWindow.document.write(`
    <html>
      <head>
        <title>BILAN FINAL - ${data.event.title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
          
          body { 
            font-family: 'Inter', sans-serif; 
            padding: 50px; 
            color: #1e293b; 
            line-height: 1.5;
          }
          .header { 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-end;
            border-bottom: 4px solid #14b8a6; 
            padding-bottom: 20px; 
            margin-bottom: 40px; 
          }
          .header h1 { margin: 0; font-size: 26px; font-weight: 800; color: #0f172a; text-transform: uppercase; }
          .header-meta { text-align: right; font-size: 12px; color: #64748b; }

          .section-title { 
            font-size: 14px; 
            font-weight: 800; 
            color: #0f172a; 
            text-transform: uppercase; 
            letter-spacing: 0.05em;
            margin: 35px 0 15px 0;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .section-title::after { content: ""; flex: 1; height: 1px; background: #e2e8f0; }

          .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
          
          .stat-card { 
            background: #f8fafc; 
            border: 1px solid #e2e8f0; 
            padding: 20px 15px; 
            border-radius: 12px; 
            text-align: center; 
          }
          .stat-value { font-size: 22px; font-weight: 800; color: #14b8a6; display: block; }
          .stat-label { font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; margin-top: 5px; }

          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { background: #f1f5f9; padding: 12px; text-align: left; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; }
          td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #334155; }
          .font-bold { font-weight: 700; }
          .status-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 10px; }
          .status-box { padding: 15px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.05); }
          .footer { 
            margin-top: 60px; 
            padding-top: 20px; 
            border-top: 1px solid #e2e8f0; 
            text-align: center; 
            font-size: 10px; 
            color: #94a3b8; 
          }

          @media print {
            body { padding: 20px; }
            .stat-card { border: 1px solid #ddd; }
          }
        </style>
      </head>
      <body onload="window.print()">
        
        <div class="header">
          <div>
            <p style="color: #14b8a6; font-weight: 700; font-size: 12px; margin: 0;">RAPPORT D'ÉVÉNEMENT</p>
            <h1>${data.event.title}</h1>
          </div>
          <div class="header-meta">
            <p><strong>Date de l'événement :</strong> ${eventDate}</p>
            <p><strong>Lieu :</strong> ${data.event.location}</p>
            <p><strong>Généré le :</strong> ${dateGenere}</p>
          </div>
        </div>
        
        <div class="section-title">Résumé financier et Ventes</div>
        <div class="grid">
          <div class="stat-card">
            <span class="stat-value">${data.ticketStats.totalSold}</span>
            <span class="stat-label">Tickets Vendus</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">${data.revenue.total.toLocaleString()}</span>
            <span class="stat-label">Recettes (FCFA)</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">${data.ticketStats.salesRate}%</span>
            <span class="stat-label">Taux de Remplissage</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">${data.lottery?.totalEntries || 0}</span>
            <span class="stat-label">Participations Tombola</span>
          </div>
        </div>
        <div class="section-title">Détails des catégories de tickets</div>
        <table>
          <thead>
            <tr>
              <th>Désignation</th>
              <th>Prix Unitaire</th>
              <th>Quantité Vendue</th>
              <th>Part du Revenu</th>
              <th>Total Catégorie</th>
            </tr>
          </thead>
          <tbody>
            ${data.ticketStats.byType
              .map(
                (t) => `
              <tr>
                <td class="font-bold">${t.typeName}</td>
                <td>${t.price.toLocaleString()} FCFA</td>
                <td>${t.sold} / ${t.available}</td>
                <td>${Math.round((t.revenue / (data.revenue.total || 1)) * 100)}%</td>
                <td class="font-bold" style="color: #0f172a;">${t.revenue.toLocaleString()} FCFA</td>
              </tr>
            `,
              )
              .join('')}
          </tbody>
        </table>

        <div class="section-title">Contrôle des accès & Logistique</div>
        <div class="status-grid">
          <div class="status-box" style="background: #f0fdf4;">
            <span style="font-size: 10px; font-weight: 700; color: #166534;">CONFIRMÉS</span>
            <div style="font-size: 24px; font-weight: 800; color: #14532d;">${data.ticketStats.byStatus.valid}</div>
            <p style="font-size: 10px; color: #166534; margin: 0;">En attente d'entrée</p>
          </div>
          <div class="status-box" style="background: #eff6ff;">
            <span style="font-size: 10px; font-weight: 700; color: #1e40af;">PRÉSENTS (SCANNÉS)</span>
            <div style="font-size: 24px; font-weight: 800; color: #1e3a8a;">${data.ticketStats.byStatus.used}</div>
            <p style="font-size: 10px; color: #1e40af; margin: 0;">Entrées validées au scan</p>
          </div>
          <div class="status-box" style="background: #fef2f2;">
            <span style="font-size: 10px; font-weight: 700; color: #991b1b;">ANNULÉS</span>
            <div style="font-size: 24px; font-weight: 800; color: #7f1d1d;">${data.ticketStats.byStatus.cancelled}</div>
            <p style="font-size: 10px; color: #991b1b; margin: 0;">Tickets rejetés/annulés</p>
          </div>
        </div>

        <div style="margin-top: 15px; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; text-align: center;">
          <span style="font-size: 12px; font-weight: 600; color: #475569;">
            🎯 Efficacité logistique (Taux de présence) : 
            <span style="color: #14b8a6; font-weight: 800;">
              ${Math.round((data.ticketStats.byStatus.used / (data.ticketStats.totalSold || 1)) * 100)}%
            </span>
          </span>
        </div>

        ${
          data.lottery && data.lottery.winners.length > 0
            ? `
          <div class="section-title">Gagnants de la Tombola (Top 5)</div>
          <table>
            <thead>
              <tr>
                <th>Position</th>
                <th>Nom du Gagnant</th>
                <th>Prix Remporté</th>
                <th>N° Chance</th>
              </tr>
            </thead>
            <tbody>
              ${data.lottery.winners
                .slice(0, 5)
                .map(
                  (w, index) => `
                <tr>
                  <td>#${index + 1}</td>
                  <td class="font-bold">${w.userName}</td>
                  <td>${w.prizeTitle}</td>
                  <td><span style="background: #f1f5f9; padding: 2px 8px; border-radius: 4px; font-family: monospace;">${w.luckyNumber}</span></td>
                </tr>
              `,
                )
                .join('')}
            </tbody>
          </table>
        `
            : ''
        }
        <div class="footer">
          Ce document est un récapitulatif officiel généré via la plateforme Visa For Culture.<br>
          ID de transaction système : ${data.event.id.toUpperCase()}
        </div>

      </body>
    </html>
  `);
  printWindow.document.close();
};
