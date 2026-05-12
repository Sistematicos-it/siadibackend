import { IncidentEntity } from 'src/modules/incident/entities/incident.entity';

export const incidentMailTemplate = (logo: string, caso: IncidentEntity) => {
  let incidentNumber,
    issueName,
    observation,
    createdAt,
    incidentType,
    assignedTo,
    pointName;

  if ('incident_number' in caso) {
    assignedTo = caso.assigned_to?.name;
    incidentNumber = caso.incident_number;
    pointName = caso.point?.name;
  } else {
    assignedTo = undefined;
  }
  issueName = caso.issue?.name;
  observation = caso.observation;
  createdAt = caso.issue?.createdAt;
  incidentType = caso.issue?.incidentType;
  return `<!DOCTYPE html>
  <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title></title>
    <style>
      html, body {
        margin: 0 auto !important;
        padding: 0 !important;
        height: 100% !important;
        width: 100% !important;
        background-color: #f9f9f9;
        font-family: sans-serif;
      }

      /* Body and container setup */
      .email-container {
        max-width: 600px;
        width: 100%;
        margin: 0 auto;
        padding: 20px;
        background-color: white;
      }

      .content {
        text-align: left;
        padding: 0 20px;
      }

      /* Aligning logo and title to center */
      .logo {
        text-align: center;
        padding: 20px 0;
      }

      .logo img {
        width: 100%;
        max-width: 300px;
        height: auto;
      }

      /* Text styling */
      .text {
        font-size: 16px;
        line-height: 1.5;
        color: #333;
      }

      .footer {
        margin-top: 20px;
        text-align: left;
        font-size: 14px;
        color: #999;
      }

      /* Responsive adjustments */
      @media screen and (max-width: 480px) {
        .email-container {
          width: 100% !important;
          padding: 10px !important;
        }

        .logo img {
          max-width: 100%;
        }

        .content {
          padding: 0 10px;
        }

        .text {
          font-size: 14px;
        }

        .footer {
          font-size: 12px;
        }
      }
    </style>
  </head>

  <body>
    <div class="email-container">
      <!-- Logo and title section -->
      <div class="logo">
        <img src="${process.env.APP_HOST}/files/static/puntoslogo.png" alt="logo" title="logo" />
      </div>
      <!-- Main content section -->
      <div class="content">
        <div class="text">
          Se le notifica que se ha generado/actualizado el incidente No. ${incidentNumber} en el sistema SIADI. A continuación, se muestran los datos del caso:
        </div>
        <div class="text"><strong>Problema:</strong> ${issueName}</div>
        <div class="text"><strong>Observaciones:</strong> ${observation}</div>
        <div class="text"><strong>Fecha creación:</strong> ${createdAt}</div>
        <div class="text"><strong>Tipo Incidente:</strong> ${incidentType}</div>
        <div class="text"><strong>Responsable:</strong> ${assignedTo}</div>
        <div class="text"><strong>Punto Digital:</strong> ${pointName}</div>
        <div class="text">
          Para más detalles, ingrese al módulo de incidentes del sistema SIADI.
        </div>
        <div class="text">Saludos cordiales</div>
      </div>

      <!-- Footer section -->
      <div class="footer">
        Este es un mensaje automático, por favor no responda a este correo.
      </div>
    </div>
  </body>
</html>
`;
};
