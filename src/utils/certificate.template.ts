export const getCertificateTemplate = (
  
  qr_course: string,
  course_type: string,
  time: string,
  course_name: string,
  name: string,
  nui: string
) => `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <title>Certificado Mintel</title>
    <style>
      html {
        font-size: 62.5%;
      }
      * {
        margin: 0;
        padding: 0;
      }
      ul,
      li {
        list-style: none;
      }
      input {
        border: none;
      }
      body {
        width: 79.2rem;
        margin: auto;
      }
      .certificado-mintel-Yjy {
        box-sizing: border-box;
        padding: 0.001rem 0rem 0rem 10.7rem;
        width: 100%;
        overflow: hidden;
        position: relative;
        display: flex;
        align-items: center;
        background-color: #ffffff;
      }

      .untitled1-1-ARV {
        width: 5rem;
        height: 5rem;
        position: absolute;
        left: 0.6rem;
        top: 52rem;
        object-fit: cover;
        vertical-align: top;
      }

      .auto-group-vtao-aPR {
        margin: 0rem 3.9rem 4.5rem 0rem;
        width: calc(100% - 3.9rem);
        display: flex;
        align-items: flex-end;
        flex-shrink: 0;
      }

      .auto-group-vtao-aPR .group-481758-d6o {
        box-sizing: border-box;
        padding: 0.9rem 4.3rem 0rem 4.6rem;
        border-top: solid 0.1rem #4e558f;
        flex-shrink: 0;
      }

      .auto-group-vtao-aPR .whatsapp-image-2023-07-21-at-844-1-hiw {
        margin-right: 17.2rem;
        width: 18.7rem;
        height: 10.7rem;
        object-fit: cover;
        vertical-align: top;
        flex-shrink: 0;
      }

      .auto-group-vtao-aPR .group-481758-d6o .nombres-y-apellidos-cargo-kSK {
        max-width: 11.5rem;
        text-align: center;
        font-size: 1.2rem;
        font-weight: 400;
        line-height: 1.3625;
        color: #415166;
        font-family: Open Sans, 'Source Sans Pro';
      }
      .certificado-mintel-Yjy .auto-group-hlaj-RSP {
        margin: 2.599rem 0.1rem 0rem 0rem;
        width: 61.8rem;
        align-items: center;
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
      }
      .certificado-mintel-Yjy .auto-group-hlaj-RSP .mintel-1-VKm {
        margin: 0rem 4.067rem 1.2rem 0rem;
        width: 23.3333rem;
        height: 5rem;
        object-fit: cover;
        vertical-align: top;
        flex-shrink: 0;
      }
      .certificado-mintel-Yjy .auto-group-hlaj-RSP .auto-group-jnyx-BTV {
        margin: 0rem 13.8rem 0rem 9.9rem;
        width: calc(100% - 23.7rem);
        height: 14.1rem;
        position: relative;
        flex-shrink: 0;
      }
      .certificado-mintel-Yjy
        .auto-group-hlaj-RSP
        .auto-group-jnyx-BTV
        .nombre-completo-6aT {
        width: 38.1rem;
        height: 7.5rem;
        position: absolute;
        left: 0;
        top: 5rem;
        text-align: center;
        font-size: 3.6rem;
        font-weight: 800;
        
        
        color: #05004e;
        font-family: Open Sans, "Source Sans Pro";
        
        
        align-items: baseline;
      }

      .auto-group-5kzu-3AX {
        
        width: calc(100%);
        height: 5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-shrink: 0;
      }

      .auto-group-5kzu-3AX .group-481755-xHV .logo-presidenciagde-1-WK1 {
        margin-right: 4.1901rem;
        width: 9.9099rem;
        height: 5rem;
        object-fit: cover;
        vertical-align: top;
        flex-shrink: 0;
      }
      

      .untitled-3-6XZ {
        margin-right: 2rem;
        width: 10rem;
        height: 10rem;
        object-fit: cover;
        vertical-align: top;
        flex-shrink: 0;
      }

      .auto-group-5kzu-3AX .para-validar--mEw {
        margin-top: 1.3rem;
        margin-left: -10rem;
        text-align: center;
        font-size: 0.9rem;
        font-weight: 400;
        line-height: 1.3625;
        color: #415166;
        font-family: Open Sans, 'Source Sans Pro';
        white-space: nowrap;
        flex-shrink: 0;
      }

      .auto-group-5kzu-3AX .group-481755-xHV .el-gobierno-del-encuentro-logo-8424ce42c8-seeklogo-1-F1h {
        width: 19.7368rem;
        height: 5rem;
        object-fit: cover;
        vertical-align: top;
        flex-shrink: 0;
      }

      .auto-group-5kzu-3AX .group-481755-xHV {
        margin-right: 10.6632rem;
        height: 100%;
        display: flex;
        align-items: center;
        flex-shrink: 0;
      }

      .certificado-mintel-Yjy
        .auto-group-hlaj-RSP
        .auto-group-jnyx-BTV
        .nombre-completo-6aT
        .nombre-completo-6aT-sub-0 {
        font-size: 3.6rem;
        font-weight: 800;
        line-height: 2.0768165588;
        letter-spacing: 0.72rem;
        color: #05004e;
        font-family: Open Sans, "Source Sans Pro";
      }
      .certificado-mintel-Yjy
        .auto-group-hlaj-RSP
        .auto-group-jnyx-BTV
        .nombre-completo-6aT
        .nombre-completo-6aT-sub-1 {
        font-size: 3.6rem;
        font-weight: 400;
        
        letter-spacing: 0.36rem;
        color: #05004e;
        font-family: Rammetto One, "Source Sans Pro";
      }
      .certificado-mintel-Yjy
        .auto-group-hlaj-RSP
        .auto-group-jnyx-BTV
        .nombre-completo-6aT
        .nombre-completo-6aT-sub-2 {
        font-size: 3.6rem;
        font-weight: 800;
        line-height: 2.0768165588;
        letter-spacing: 0.72rem;
        color: #05004e;
        font-family: Open Sans, "Source Sans Pro";
      }
      .certificado-mintel-Yjy
        .auto-group-hlaj-RSP
        .auto-group-jnyx-BTV
        .certifica-a3h {
        width: 26.8rem;
        height: 6.7rem;
        position: absolute;
        left: 5.6rem;
        top: 0;
        text-align: center;
        font-size: 3.2rem;
        font-weight: 400;
        line-height: 2.0768165588;
        letter-spacing: 0.64rem;
        color: #05004e;
        font-family: Notable, "Source Sans Pro";
        white-space: nowrap;
      }
      .certificado-mintel-Yjy
        .auto-group-hlaj-RSP
        .con-cdula-de-ciudadana-nro-1002344567-3hy {
        margin: 0rem 3.9rem 2.6rem 0rem;
        text-align: center;
        font-size: 1.2rem;
        font-weight: 400;
        line-height: 1.3625;
        color: #415166;
        font-family: Open Sans, "Source Sans Pro";
        white-space: nowrap;
        flex-shrink: 0;
      }
      .certificado-mintel-Yjy
        .auto-group-hlaj-RSP
        .que-a-traves-del-proyecto-puntos-digitales-gratuitos-aprobo-de-manera-exitosa-el-curso-de-nombre-del-curso-mediante-la-formacion-virtual-de-30-horas-iJK {
        margin: 0rem 4rem 1.3rem 0rem;
        max-width: 52.8rem;
        text-align: center;
        font-size: 1.5rem;
        font-weight: 400;
        line-height: 1.3618164062;
        color: #415166;
        font-family: Open Sans, "Source Sans Pro";
        flex-shrink: 0;
      }
      .certificado-mintel-Yjy
        .auto-group-hlaj-RSP
        .que-a-traves-del-proyecto-puntos-digitales-gratuitos-aprobo-de-manera-exitosa-el-curso-de-nombre-del-curso-mediante-la-formacion-virtual-de-30-horas-iJK
        .que-a-traves-del-proyecto-puntos-digitales-gratuitos-aprobo-de-manera-exitosa-el-curso-de-nombre-del-curso-mediante-la-formacion-virtual-de-30-horas-iJK-sub-0 {
        font-size: 1.5rem;
        font-weight: 400;
        line-height: 1.3625;
        color: #415166;
        font-family: Open Sans, "Source Sans Pro";
      }
      .certificado-mintel-Yjy
        .auto-group-hlaj-RSP
        .que-a-traves-del-proyecto-puntos-digitales-gratuitos-aprobo-de-manera-exitosa-el-curso-de-nombre-del-curso-mediante-la-formacion-virtual-de-30-horas-iJK
        .que-a-traves-del-proyecto-puntos-digitales-gratuitos-aprobo-de-manera-exitosa-el-curso-de-nombre-del-curso-mediante-la-formacion-virtual-de-30-horas-iJK-sub-1 {
        font-size: 1.5rem;
        font-weight: 700;
        line-height: 1.3625;
        color: #415166;
        font-family: Open Sans, "Source Sans Pro";
      }
      .certificado-mintel-Yjy
        .auto-group-hlaj-RSP
        .que-a-traves-del-proyecto-puntos-digitales-gratuitos-aprobo-de-manera-exitosa-el-curso-de-nombre-del-curso-mediante-la-formacion-virtual-de-30-horas-iJK
        .que-a-traves-del-proyecto-puntos-digitales-gratuitos-aprobo-de-manera-exitosa-el-curso-de-nombre-del-curso-mediante-la-formacion-virtual-de-30-horas-iJK-sub-2 {
        font-size: 1.5rem;
        font-weight: 400;
        line-height: 1.3625;
        color: #415166;
        font-family: Open Sans, "Source Sans Pro";
      }
      .certificado-mintel-Yjy .auto-group-hlaj-RSP .untitled-2-boM {
        margin-right: 4rem;
        width: 8.6rem;
        height: 8.6rem;
        object-fit: cover;
        vertical-align: top;
        flex-shrink: 0;
      }
      .certificado-mintel-Yjy .auto-group-hlaj-RSP .group-481758-XBD {
        margin: 0rem 3.9rem 4.2rem 0rem;
        width: 57.9rem;
        align-items: center;
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
      }
      .certificado-mintel-Yjy
        .auto-group-hlaj-RSP
        .group-481758-XBD
        .auto-group-z2bh-eFq {
        margin-bottom: 0.8rem;
        width: 40%;
        height: 0.1rem;
        border-top: solid 0.1rem #4e558f;
        box-sizing: border-box;
        flex-shrink: 0;
      }

      .auto-group-z2bh-111 {
        margin-bottom: 0.8rem;
        width: 100%;
        height: 0.1rem;

        box-sizing: border-box;
        display: flex;
        justify-content: space-between;
        flex-shrink: 0;
      }
      .certificado-mintel-Yjy
        .auto-group-hlaj-RSP
        .group-481758-XBD
        .auto-group-qwtm-WYw {
        margin: 0rem 4.3rem 0rem 3.5rem;
        width: calc(100% - 7.8rem);
        display: flex;
        align-items: center;
        flex-shrink: 0;
      }
      .certificado-mintel-Yjy
        .auto-group-hlaj-RSP
        .group-481758-XBD
        .auto-group-qwtm-WYw
        .nombres-y-apellidos-cargo-RA7 {
        margin: 0rem 27.1rem 0.3rem 0rem;
        max-width: 11.5rem;
        text-align: center;
        font-size: 1.2rem;
        font-weight: 400;
        line-height: 1.3625;
        color: #415166;
        font-family: Open Sans, "Source Sans Pro";
        flex-shrink: 0;
      }
      .certificado-mintel-Yjy
        .auto-group-hlaj-RSP
        .group-481758-XBD
        .auto-group-qwtm-WYw
        .nombres-y-apellidos-cargo-6n3 {
        margin-top: 0.3rem;
        max-width: 11.5rem;
        text-align: center;
        font-size: 1.2rem;
        font-weight: 400;
        line-height: 1.3625;
        color: #415166;
        font-family: Open Sans, "Source Sans Pro";
        flex-shrink: 0;
      }
      .certificado-mintel-Yjy .auto-group-hlaj-RSP .auto-group-nhfv-Pm9 {
        margin-left: 12rem;
        width: calc(100% - 12rem);
        height: 5rem;
        display: flex;
        align-items: center;
        flex-shrink: 0;
      }
      .certificado-mintel-Yjy
        .auto-group-hlaj-RSP
        .auto-group-nhfv-Pm9
        .group-481755-Kuh {
        margin-right: 10.6632rem;
        height: 100%;
        display: flex;
        align-items: center;
        flex-shrink: 0;
      }
      .certificado-mintel-Yjy
        .auto-group-hlaj-RSP
        .auto-group-nhfv-Pm9
        .group-481755-Kuh
        .logo-presidenciagde-1-UXh {
        margin-right: 4.1901rem;
        width: 9.9099rem;
        height: 5rem;
        object-fit: cover;
        vertical-align: top;
        flex-shrink: 0;
      }
      .certificado-mintel-Yjy
        .auto-group-hlaj-RSP
        .auto-group-nhfv-Pm9
        .group-481755-Kuh
        .el-gobierno-del-encuentro-logo-8424ce42c8-seeklogo-1-QgF {
        width: 19.7368rem;
        height: 5rem;
        object-fit: cover;
        vertical-align: top;
        flex-shrink: 0;
      }
      .certificado-mintel-Yjy
        .auto-group-hlaj-RSP
        .auto-group-nhfv-Pm9
        .para-validar--v8o {
        margin-top: 1.3rem;
        text-align: center;
        font-size: 0.9rem;
        font-weight: 400;
        line-height: 1.3625;
        color: #415166;
        font-family: Open Sans, "Source Sans Pro";
        white-space: nowrap;
        flex-shrink: 0;
      }
      .certificado-mintel-Yjy .auto-group-fq63-nRu {
        width: 6.9967rem;
        height: 61.2393rem;
        position: relative;
        flex-shrink: 0;
      }
      .certificado-mintel-Yjy .auto-group-fq63-nRu .group-481757-i4f {
        box-sizing: border-box;
        padding: 0.004rem 0.428rem 21.077rem 0.346rem;
        width: 6.9967rem;
        height: 61.2393rem;
        position: absolute;
        left: 0;
        top: 0;
        align-items: center;
        display: flex;
        flex-direction: column;
        background: linear-gradient(224.82deg, #27516d 10%, #ffffff 90%);
      }
      .certificado-mintel-Yjy
        .auto-group-fq63-nRu
        .group-481757-i4f
        .vector-obu {
        margin-bottom: 0.0407rem;
        width: 6.2231rem;
        height: 20.0591rem;
        object-fit: contain;
        vertical-align: top;
        flex-shrink: 0;
      }
      .certificado-mintel-Yjy
        .auto-group-fq63-nRu
        .group-481757-i4f
        .vector-9Qs {
        width: 6.2231rem;
        height: 20.0591rem;
        object-fit: contain;
        vertical-align: top;
        flex-shrink: 0;
      }
      .certificado-mintel-Yjy .auto-group-fq63-nRu .untitled1-1-3m9 {
        width: 5rem;
        height: 5rem;
        position: absolute;
        left: 0.6rem;
        top: 54.1193rem;
        object-fit: cover;
        vertical-align: top;
      }
    </style>
  </head>
  <body>
    <div class="certificado-mintel-Yjy">
      <div class="auto-group-hlaj-RSP">
        <img class="mintel-1-VKm" src="${process.env.APP_HOST}/files/static/logo_mintel.png" />
        <div class="auto-group-jnyx-BTV">
          <p class="nombre-completo-6aT">
            <span 
              >${name}</span
            >
          </p>
          <p class="certifica-a3h">CERTIFICA</p>
        </div>
        <p class="con-cdula-de-ciudadana-nro-1002344567-3hy">
          Con Cédula de Ciudadanía Nro. ${nui}
        </p>
        <p
          class="que-a-traves-del-proyecto-puntos-digitales-gratuitos-aprobo-de-manera-exitosa-el-curso-de-nombre-del-curso-mediante-la-formacion-virtual-de-30-horas-iJK"
        >
          <span
            class="que-a-traves-del-proyecto-puntos-digitales-gratuitos-aprobo-de-manera-exitosa-el-curso-de-nombre-del-curso-mediante-la-formacion-virtual-de-30-horas-iJK-sub-0"
            >Que a traves del Proyecto Puntos Digitales Gratuitos, aprobo de
            manera exitosa el curso de:
          </span>
          <span
            class="que-a-traves-del-proyecto-puntos-digitales-gratuitos-aprobo-de-manera-exitosa-el-curso-de-nombre-del-curso-mediante-la-formacion-virtual-de-30-horas-iJK-sub-1"
            >${course_name}</span
          >
          <span
            class="que-a-traves-del-proyecto-puntos-digitales-gratuitos-aprobo-de-manera-exitosa-el-curso-de-nombre-del-curso-mediante-la-formacion-virtual-de-30-horas-iJK-sub-2"
            >, mediante la formacion ${course_type} de ${time}.
          </span>
        </p>
        
        <div class="auto-group-vtao-aPR">
          <img class="whatsapp-image-2023-07-21-at-844-1-hiw" src="${process.env.APP_HOST}/files/static/firmas.png"/>
          <div class="group-481758-d6o">
            <p class="nombres-y-apellidos-cargo-kSK">
            Nombres y apellidos
            <br/>
            Cargo
            </p>
          </div>
        </div>

        <div class="auto-group-5kzu-3AX">
          <div class="untitled-3-6XZ">
           ${qr_course}
          </div>
          <div class="group-481755-xHV">
            <img class="logo-presidenciagde-1-WK1" src="${process.env.APP_HOST}/files/static/logo_rep.png">
            <img class="el-gobierno-del-encuentro-logo-8424ce42c8-seeklogo-1-F1h" src="${process.env.APP_HOST}/files/static/logo_gob.png">
          </div>
        </div>
        
      </div>
      <div class="auto-group-fq63-nRu">
        
        <div class="group-481757-i4f">
          <img class="vector-obu"
            src="${process.env.APP_HOST}/files/static/banner1.png" />
          <img class="vector-9Qs"
            src="${process.env.APP_HOST}/files/static/banner2.png" />
        </div>
        
      </div>
    </div>
  </body>
</html>
`;
