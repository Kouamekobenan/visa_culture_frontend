import { Ticket } from "@/app/frontend/module/tickets/domain/entities/ticket.entity";
import { formatShortDate } from "@/app/frontend/utils/types/conversion.data";

export const handlePrintTicket = (t: Ticket) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
    <html>
      <head>
        <title>Ticket - ${t.code}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;500;700&display=swap');
          
          body { 
            margin: 0; 
            padding: 0; 
            background: #f0f0f0; 
            font-family: 'Space Grotesk', sans-serif; 
          }

          /* Conteneur principal format Paysage */
          .ticket-container {
            width: 850px;
            height: 320px;
            margin: 50px auto;
            display: flex;
            background: #111;
            color: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            position: relative;
          }

          /* Zone Gauche : Contrôle (Aspect Gradient Y2K) */
          .left-stub {
            width: 250px;
            background: linear-gradient(135deg, #a5f3fc 0%, #f9a8d4 100%);
            padding: 30px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
            color: #111;
            border-right: 2px dashed rgba(0,0,0,0.1);
          }

          .barcode-area {
            text-align: center;
          }

          .barcode-mock {
            height: 80px;
            width: 160px;
            background: linear-gradient(90deg, #111 2px, transparent 2px);
            background-size: 6px 100%;
          }

          .code-text {
            font-family: monospace;
            font-size: 14px;
            font-weight: bold;
            margin-top: 10px;
          }

          /* Zone Droite : Contenu Principal */
          .main-content {
            flex: 1;
            position: relative;
            display: flex;
          }

          .info-side {
            flex: 1.2;
            padding: 40px;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }

          .event-title {
            font-size: 48px;
            font-weight: 800;
            line-height: 1;
            margin: 0 0 15px 0;
            text-transform: uppercase;
            letter-spacing: -2px;
          }

          .details {
            font-size: 18px;
            font-weight: 300;
            color: #ccc;
          }

          .meta-info {
            margin-top: 30px;
            display: flex;
            gap: 20px;
          }

          .badge {
            background: rgba(255,255,255,0.1);
            padding: 5px 15px;
            border-radius: 50px;
            font-size: 12px;
            text-transform: uppercase;
            border: 1px solid rgba(255,255,255,0.2);
          }

          /* Image d'illustration à droite (comme sur ton modèle) */
          .image-side {
            flex: 0.8;
            background: url('${t.event?.imageUrl}') no-repeat center center;
            background-size: cover;
            position: relative;
          }

          .image-side::after {
            content: '';
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background: linear-gradient(to right, #111, transparent);
          }

          @media print {
            body { background: white; }
            .ticket-container { 
              box-shadow: none; 
              -webkit-print-color-adjust: exact; 
              margin: 0;
            }
          }
        </style>
      </head>
      <body onload="window.print()">
        <div class="ticket-container">
          <div class="left-stub">
            <div style="font-weight: 800; font-size: 24px;">${t.ticketType?.name}</div>
            <div class="barcode-area">
              <div class="barcode-mock"></div>
              <div class="code-text">${t.code}</div>
            </div>
            <div style="font-size: 10px; text-align: center; font-weight: 500;">
              www.visaForCulture.com<br>
              NON REMBOURSABLE
            </div>
          </div>

          <div class="main-content">
            <div class="info-side">
              <h1 class="event-title">${t.event?.title}</h1>
              <div class="details">
                ${formatShortDate(t.event?.date ?? '')}<br>
                <strong>${t.event?.location}</strong>
              </div>
              <div class="meta-info">
                <div class="badge">Client: ${t.user?.name}</div>
                <div class="badge">Prix: ${t.ticketType?.price.toLocaleString()} FCFA</div>
              </div>
            </div>
            <div class="image-side"></div>
          </div>
          <div>
          <div/>
        </div>
      </body>
    </html>
  `);
    printWindow.document.close();
  };