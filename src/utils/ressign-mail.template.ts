import { RessignEmailDTO } from 'src/modules/email/dto/email.dto';

export const getRessignMailTemplate = ({
  point,
  parish,
  canton,
  province,
  name,
  nui,
  role,
  phone,
  email,
  date,
}: RessignEmailDTO) => {
  return `<!DOCTYPE html>
  <html
    lang="en"
    xmlns="http://www.w3.org/1999/xhtml"
    xmlns:v="urn:schemas-microsoft-com:vml"
    xmlns:o="urn:schemas-microsoft-com:office:office"
  >
    <head>
      <meta charset="utf-8" />
      <!-- utf-8 works for most cases -->
      <meta name="viewport" content="width=device-width" />
      <!-- Forcing initial-scale shouldn't be necessary -->
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <!-- Use the latest (edge) version of IE rendering engine -->
      <meta name="x-apple-disable-message-reformatting" />
      <!-- Disable auto-scale in iOS 10 Mail entirely -->
      <meta
        name="format-detection"
        content="telephone=no,address=no,email=no,date=no,url=no"
      />
      <!-- Tell iOS not to automatically link certain text strings. -->
      <meta name="color-scheme" content="light" />
      <meta name="supported-color-schemes" content="light" />
      <title></title>
      <!-- The title tag shows in email notifications, like Android 4.4. -->
  
      <!-- What it does: Makes background images in 72ppi Outlook render at correct size. -->
      <!--[if gte mso 9]>
        <xml>
          <o:OfficeDocumentSettings>
            <o:AllowPNG />
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      <![endif]-->
  
      <!-- Web Font / @font-face : BEGIN -->
      <!-- NOTE: If web fonts are not required, lines 23 - 41 can be safely removed. -->
  
      <!-- Desktop Outlook chokes on web font references and defaults to Times New Roman, so we force a safe fallback font. -->
      <!--[if mso]>
        <style>
          * {
            font-family: sans-serif !important;
          }
        </style>
      <![endif]-->
  
      <!-- All other clients get the webfont reference; some will render the font and others will silently fail to the fallbacks. More on that here: http://stylecampaign.com/blog/2015/02/webfont-support-in-email/ -->
      <!--[if !mso]><!-->
      <!-- insert web font reference, eg: <link href='https://fonts.googleapis.com/css?family=Roboto:400,700' rel='stylesheet' type='text/css'> -->
      <!--<![endif]-->
  
      <!-- Web Font / @font-face : END -->
  
      <!-- CSS Reset : BEGIN -->
      <style>
        /* What it does: Tells the email client that only light styles are provided but the client can transform them to dark. A duplicate of meta color-scheme meta tag above. */
        :root {
          color-scheme: light;
          supported-color-schemes: light;
        }
  
        /* What it does: Remove spaces around the email design added by some email clients. */
        /* Beware: It can remove the padding / margin and add a background color to the compose a reply window. */
        html,
        body {
          margin: 0 auto !important;
          padding: 0 !important;
          height: 100% !important;
          width: 100% !important;
        }
  
        /* What it does: Stops email clients resizing small text. */
        * {
          -ms-text-size-adjust: 100%;
          -webkit-text-size-adjust: 100%;
        }
  
        /* What it does: Centers email on Android 4.4 */
        div[style*='margin: 16px 0'] {
          margin: 0 !important;
        }
        /* What it does: forces Samsung Android mail clients to use the entire viewport */
        #MessageViewBody,
        #MessageWebViewDiv {
          width: 100% !important;
        }
  
        /* What it does: Stops Outlook from adding extra spacing to tables. */
        table,
        td {
          mso-table-lspace: 0pt !important;
          mso-table-rspace: 0pt !important;
        }
  
        /* What it does: Fixes webkit padding issue. */
        table {
          border-spacing: 0 !important;
          border-collapse: collapse !important;
          table-layout: fixed !important;
          margin: 0 auto !important;
        }
  
        /* What it does: Uses a better rendering method when resizing images in IE. */
        img {
          -ms-interpolation-mode: bicubic;
        }
  
        /* What it does: Prevents Windows 10 Mail from underlining links despite inline CSS. Styles for underlined links should be inline. */
        a {
          text-decoration: none;
        }
  
        /* What it does: A work-around for email clients meddling in triggered links. */
        a[x-apple-data-detectors],  /* iOS */
              .unstyle-auto-detected-links a,
              .aBn {
          border-bottom: 0 !important;
          cursor: default !important;
          color: inherit !important;
          text-decoration: none !important;
          font-size: inherit !important;
          font-family: inherit !important;
          font-weight: inherit !important;
          line-height: inherit !important;
        }
  
        /* What it does: Prevents Gmail from changing the text color in conversation threads. */
        .im {
          color: inherit !important;
        }
  
        /* What it does: Prevents Gmail from displaying a download button on large, non-linked images. */
        .a6S {
          display: none !important;
          opacity: 0.01 !important;
        }
        /* If the above doesn't work, add a .g-img class to any image in question. */
        img.g-img + div {
          display: none !important;
        }
  
        /* What it does: Removes right gutter in Gmail iOS app: https://github.com/TedGoas/Cerberus/issues/89  */
        /* Create one of these media queries for each additional viewport size you'd like to fix */
  
        /* iPhone 4, 4S, 5, 5S, 5C, and 5SE */
        @media only screen and (min-device-width: 320px) and (max-device-width: 374px) {
          u ~ div .email-container {
            min-width: 320px !important;
          }
        }
        /* iPhone 6, 6S, 7, 8, and X */
        @media only screen and (min-device-width: 375px) and (max-device-width: 413px) {
          u ~ div .email-container {
            min-width: 375px !important;
          }
        }
        /* iPhone 6+, 7+, and 8+ */
        @media only screen and (min-device-width: 414px) {
          u ~ div .email-container {
            min-width: 414px !important;
          }
        }
      </style>
      <!-- CSS Reset : END -->
  
      <!-- Progressive Enhancements : BEGIN -->
      <style>
        /* What it does: Hover styles for buttons */
        .button-td,
        .button-a {
          transition: all 100ms ease-in;
        }
        .button-td-primary:hover,
        .button-a-primary:hover {
          background: #555555 !important;
          border-color: #555555 !important;
        }
  
        /* Media Queries */
        @media screen and (max-width: 480px) {
          /* What it does: Forces table cells into full-width rows. */
          .stack-column,
          .stack-column-center {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            direction: ltr !important;
          }
          /* And center justify these ones. */
          .stack-column-center {
            text-align: center !important;
          }
  
          /* What it does: Generic utility class for centering. Useful for images, buttons, and nested tables. */
          .center-on-narrow {
            text-align: center !important;
            display: block !important;
            margin-left: auto !important;
            margin-right: auto !important;
            float: none !important;
          }
          table.center-on-narrow {
            display: inline-block !important;
          }
  
          /* What it does: Adjust typography on small screens to improve readability */
          .email-container p {
            font-size: 17px !important;
          }
        }
      </style>
      <!-- Progressive Enhancements : END -->
    </head>
    <!--
        The email background color (#F9F9F9) is defined in three places:
        1. body tag: for most email clients
        2. center tag: for Gmail and Inbox mobile apps and web versions of Gmail, GSuite, Inbox, Yahoo, AOL, Libero, Comcast, freenet, Mail.ru, Orange.fr
        3. mso conditional: For Windows 10 Mail
      -->
    <body
      width="100%"
      style="
        margin: 0;
        padding: 0 !important;
        mso-line-height-rule: exactly;
        background-color: #f9f9f9;
        
      "
    >
      <center
        role="article"
        aria-roledescription="email"
        lang="en"
        style="width: 100%; background-color: #f9f9f9"
      >
        <!--[if mso | IE]>
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F9F9F9;">
          <tr>
          <td>
          <![endif]-->
  
        <!-- Visually Hidden Preheader Text : BEGIN -->
        <div
          style="max-height: 0; overflow: hidden; mso-hide: all"
          aria-hidden="true"
        >
          Renuncia
        </div>
        <!-- Visually Hidden Preheader Text : END -->
  
        <!-- Create white space after the desired preview text so email clients don’t pull other distracting text into the inbox preview. Extend as necessary. -->
        <!-- Preview Text Spacing Hack : BEGIN -->
        <div
          style="
            display: none;
            font-size: 1px;
            line-height: 1px;
            max-height: 0px;
            max-width: 0px;
            opacity: 0;
            overflow: hidden;
            mso-hide: all;
            font-family: sans-serif;
          "
        >
          &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
        </div>
        <!-- Preview Text Spacing Hack : END -->
  
        <!--
                  Set the email width. Defined in two places:
                  1. max-width for all clients except Desktop Windows Outlook, allowing the email to squish on narrow but never go wider than 680px.
                  2. MSO tags for Desktop Windows Outlook enforce a 680px width.
                  Note: The Fluid and Responsive templates have a different width (600px). The hybrid grid is more "fragile", and I've found that 680px is a good width. Change with caution.
              -->
        <div style="max-width: 1128px; margin: 0 auto;" class="email-container">
          <!--[if mso]>
                  <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="600">
                  <tr>
                  <td>
                  <![endif]-->
  
          <!-- Email Body : BEGIN -->
          <table
            role="presentation"
            cellspacing="0"
            cellpadding="0"
            border="0"
            width="100%"
            style="margin: auto"
          >
            <!-- Email Header : BEGIN -->
            <tr>
              <td
                style="
                  padding: 20px 0;
                  text-align: center;
                  background-color: #f9f9f9;
                "
              ></td>
            </tr>
            <!-- Email Header : END -->
  
            <!-- Hero Image, Flush : BEGIN -->
            <tr></tr>
            <!-- Hero Image, Flush : END -->
  
            <!-- 1 Column Text + Button : BEGIN -->
            <tr>
              <td style="background-color: #ffffff">
                <table
                  role="presentation"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  width="100%"
                >
                  <tr
                   
                  >
                  <img
                    width="1128"
                    height="120"
                    src="https://drive.google.com/uc?export=view&id=1Gq3QCM1Cp1sgXGccamE1_cx3NP5P3Zr0"
                    alt="logo"
                    title="logo"
                  >
                    
                  </tr>
                  <tr style="text-align: center; ">
                    <td
                      style="
                        font-family: sans-serif;
                        font-size: 15px;
                        line-height: 20px;
                        color: #555555;
                        
                      "
                    >
                      <div
                        style="
                          color: #242c5a;
                          font-size: 36px;
                          font-family: Verdana, Tahoma, sans-serif !important;;
                          font-weight: 800;
                          line-height: 74.77px;
                          letter-spacing: 7.2px;
                          word-wrap: break-word;
                          display: flex;
                          flex-direction: row;
                          align-items: center;
                          display: inline-flex;
                        "
                      >
                        
                        <h3 style="margin-left: 10px">CARTA DE RENUNCIA</h3>
                      </div>
                      <div
                        style="
                          width: 100%;
                          height: 100%;
                          border: 0.5px #2983f4 solid;
                        "
                      ></div>
                      <div style="display: flex;
                      justify-content: center;">
                      <div style="text-justify: auto; text-align: justify; margin:auto; padding: 0 20px 0 20px;">
                      
                      
                      <p style="font-size: 18px; line-height: 140%">
                        <span
            style="
              color: black;
              font-size: 20px;
              font-family: Open Sans;
              font-weight: 400;
              word-wrap: break-word;
            "
            >BACHILLER EN CIENCIAS<br />ANDERSON JOEL FIGUEROA QUISHPE<br />GERENTE
            GENERAL DE LA CORPORACIÓN NACIONAL DE TELECOMUNICACIONES CNT E.P.<br />Presente<br /><br /><br /></span
          >
                        
                      </p>
                      
                      <div style="display: flex;height: 30px;">
                      <p style="font-size: 24px; line-height: 140%; ">
                        <div style="color: black; font-size: 20px; font-family: Verdana, Tahoma, sans-serif !important;; font-weight: 700; word-wrap: break-word;height: fit-content;">Asunto:</div>
                      </p>
                      <p style="font-size: 24px; line-height: 140%; ">
                        <div style="
                        font-size: 24px; 
                        color: #666666;
                         color: black; font-size: 18px; font-family: Verdana, Tahoma, sans-serif !important;; font-weight: 400; word-wrap: break-word;height: fit-content;">Renuncia al cargo de Facilitador del Punto del Encuentro El Valle</div>
                      </p>
  
                    </div>
                    <br /><br /><br />
                    <span
            style="
              color: black;
              font-size: 20px;
              font-family: Open Sans;
              font-weight: 400;
              word-wrap: break-word;
            "
            >Me es grato dirigirme a usted para desearle un atento saludo
            deseándole éxitos en sus actividades diarias que a bien desempeña al
            servicio de todos los ciudadanos en la mejor empresa de
            telecomunicaciones del país.<br /><br />Por medio de la presente
            quiero expresar un agradecimiento especial a la Corporación Nacional
            de Telecomunicaciones, al haber trabajado en tan prestigiosa
            institución, así mismo el Agradecimiento al Proyecto Emblemático
            Puntos del Encuentro del cual tengo el orgullo de haber laborado
            en calidad de ${role} ${
    point
      ? `del Punto del Encuentro ${point}, parroquia
            ${parish} , cantón ${canton}, provincia ${province}`
      : ''
  }.<br /><br />El motivo de la
            presente es para comunicarle mi renuncia al cargo de ${role} ${
    point
      ? `del
            Punto Digital Gratuito ${point}`
      : ''
  }, debido a  , informo que hoy es mi
            último día de labores en la institución con fecha ${date}, agradezco del cual me ha sido grato haber servido a mi
            parroquia dentro de este importante proyecto.<br /><br />Agradezco la
            confianza y oportunidad brindada.<br /><br />Atentamente<br /><br /><br />Nombres
            y Apellidos: ${name}<br />Número de cédula:${nui}<br />Cargo:
            ${role}<br />Teléfono:${phone}<br />Correo:${email}</span
          >
                    
                    <br />
                      <p style="font-size: 18px; line-height: 140%">
                        <span
                          style="
                          color: black;
                          font-size: 18px;
                          font-family: Verdana, Tahoma, sans-serif !important;;
                          font-weight: 400;
                          word-wrap: break-word;
                          
                          "
                          >Atentamente.</span
                        >
                      </p>
  
                      <br />
                      
                    </div>
                  </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <!-- Email Body : END -->
  
          <!-- Email Footer : BEGIN -->
          
    </body>
  </html>
  `;
};
