// não altere!
const serialport = require('serialport');
const express = require('express');
const mysql = require('mysql2');
const sql = require('mssql');

// não altere!
const SERIAL_BAUD_RATE = 9600;
const SERVIDOR_PORTA = 3300;

// configure a linha abaixo caso queira que os dados capturados sejam inseridos no banco de dados.
// false -> nao insere
// true -> insere
const HABILITAR_OPERACAO_INSERIR = false;

// altere o valor da variável AMBIENTE para o valor desejado:
// API conectada ao banco de dados remoto, SQL Server -> 'producao'
// API conectada ao banco de dados local, MySQL Workbench - 'desenvolvimento'
const AMBIENTE = 'desenvolvimento';

const serial = async (
    valoresTemp1,
    valoresTemp2,
    valoresTemp3,
    valoresTemp4,
    valoresTemp5,
    valoresUmi1,
    valoresUmi2,
    valoresUmi3,
    valoresUmi4,
    valoresUmi5
) => {
    let poolBancoDados = ''

    if (AMBIENTE == 'desenvolvimento') {
        poolBancoDados = mysql.createPool(
            {
                // altere!
                // CREDENCIAIS DO BANCO LOCAL - MYSQL WORKBENCH
                host: 'localhost',
                user: 'insertgrupo10',
                password: '2022',
                database: 'cottonanalytics'
            }
        ).promise();
    } else if (AMBIENTE == 'producao') {
        console.log('Projeto rodando inserindo dados em nuvem. Configure as credenciais abaixo.');
    } else {
        throw new Error('Ambiente não configurado. Verifique o arquivo "main.js" e tente novamente.');
    }


    const portas = await serialport.SerialPort.list();
    const portaArduino = portas.find((porta) => porta.vendorId == 2341 && porta.productId == 43);
    if (!portaArduino) {
        throw new Error('O arduino não foi encontrado em nenhuma porta serial');
    }
    const arduino = new serialport.SerialPort(
        {
            path: portaArduino.path,
            baudRate: SERIAL_BAUD_RATE
        }
    );
    arduino.on('open', () => {
        console.log(`A leitura do arduino foi iniciada na porta ${portaArduino.path} utilizando Baud Rate de ${SERIAL_BAUD_RATE}`);
    });
    arduino.pipe(new serialport.ReadlineParser({ delimiter: '\r\n' })).on('data', async (data) => {
        console.log(data);
        const valores = data.split(';');
        const Temp1 = parseFloat(valores[0]);
        const Temp2 = parseFloat(valores[1]);
        const Temp3 = parseFloat(valores[2]);
        const Temp4 = parseFloat(valores[3]);
        const Temp5 = parseFloat(valores[4]);
        const Umi1 = parseFloat(valores[5]);
        const Umi2 = parseFloat(valores[6]);
        const Umi3 = parseFloat(valores[7]);
        const Umi4 = parseFloat(valores[8]);
        const Umi5 = parseFloat(valores[9]);

        valoresTemp1.push(Temp1);
        valoresTemp2.push(Temp2);
        valoresTemp3.push(Temp3);
        valoresTemp4.push(Temp4);
        valoresTemp5.push(Temp5);

        valoresUmi1.push(Umi1);
        valoresUmi2.push(Umi2);
        valoresUmi3.push(Umi3);
        valoresUmi4.push(Umi4);
        valoresUmi5.push(Umi5);

        if (HABILITAR_OPERACAO_INSERIR) {
            if (AMBIENTE == 'producao') {
                // altere!
                // Este insert irá inserir os dados na tabela "medida"
                // -> altere nome da tabela e colunas se necessário
                // Este insert irá inserir dados de fk_aquario id=1 (fixo no comando do insert abaixo)
                // >> Importante! você deve ter o aquario de id 1 cadastrado.
                sqlquery = `INSERT INTO medida (dht11_umidade, dht11_temperatura, luminosidade, lm35_temperatura, chave, momento, fk_aquario) VALUES (${dht11Umidade}, ${dht11Temperatura}, ${luminosidade}, ${lm35Temperatura}, ${chave}, CURRENT_TIMESTAMP, 1)`;

                // CREDENCIAIS DO BANCO REMOTO - SQL SERVER
                // Importante! você deve ter criado o usuário abaixo com os comandos presentes no arquivo
                // "script-criacao-usuario-sqlserver.sql", presente neste diretório.
                const connStr = "Server=servidor-acquatec.database.windows.net;Database=bd-acquatec;User Id=usuarioParaAPIArduino_datawriter;Password=#Gf_senhaParaAPI;";

                function inserirComando(conn, sqlquery) {
                    conn.query(sqlquery);
                    console.log("valores inseridos no banco: ", dht11Umidade + ", " + dht11Temperatura + ", " + luminosidade + ", " + lm35Temperatura + ", " + chave)
                }

                sql.connect(connStr)
                    .then(conn => inserirComando(conn, sqlquery))
                    .catch(err => console.log("erro! " + err));

            } else if (AMBIENTE == 'desenvolvimento') {

                // altere!
                // Este insert irá inserir os dados na tabela "medida"
                // -> altere nome da tabela e colunas se necessário
                // Este insert irá inserir dados de fk_aquario id=1 (fixo no comando do insert abaixo)
                // >> você deve ter o aquario de id 1 cadastrado.
                await poolBancoDados.execute(
                    'INSERT INTO dados (temp1, temp2, temp3, temp4, temp5, umi1, umi2, umi3, umi4, umi5) VALUES (?, ?, ?, ?, ?, ?,?,?,?,?)',
                    [temp1, temp2, temp3, temp4, temp5, umi1, umi2, umi3, umi4, umi5]
                );
                console.log("valores inseridos no banco: ", temp1 + ", " + temp2 + ", " + temp3 + ", " + temp4 + ", " + temp5 +"," + umi1 + ","
                + umi2 + "," + umi3 + ","+ umi4 + "," + umi5);

            } else {
                throw new Error('Ambiente não configurado. Verifique o arquivo "main.js" e tente novamente.');
            }
        }
    });
    arduino.on('error', (mensagem) => {
        console.error(`Erro no arduino (Mensagem: ${mensagem}`)
    });
}


// não altere!
const servidor = (
    valoresTemp1,
    valoresTemp2,
    valoresTemp3,
    valoresTemp4,
    valoresTemp5,
    valoresUmi1,
    valoresUmi2,
    valoresUmi3,
    valoresUmi4,
    valoresUmi5
) => {
    const app = express();
    app.use((request, response, next) => {
        response.header('Access-Control-Allow-Origin', '*');
        response.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
        next();
    });
    app.listen(SERVIDOR_PORTA, () => {
        console.log(`API executada com sucesso na porta ${SERVIDOR_PORTA}`);
    });
    app.get('/sensores/dht11/temp1', (_, response) => {
        return response.json(valoresTemp1);
    });
    app.get('/sensores/dht11/temp2', (_, response) => {
        return response.json(valoresTemp2);
    });
    app.get('/sensores/dht11/temp3', (_, response) => {
        return response.json(valoresTemp3);
    });
    app.get('/sensores/dht11/temp4', (_, response) => {
        return response.json(valoresTemp4);
    });
    app.get('/sensores/dht11/temp5', (_, response) => {
        return response.json(valoresTemp5);
    });
    app.get('/sensores/dht11/umi1', (_, response) => {
        return response.json(valoresUmi1);
    });
    app.get('/sensores/dht11/umi2', (_, response) => {
        return response.json(valoresUmi2);
    });
    app.get('/sensores/dht11/umi3', (_, response) => {
        return response.json(valoresUmi3);
    });
    app.get('/sensores/dht11/umi4', (_, response) => {
        return response.json(valoresUmi4);
    });
    app.get('/sensores/dht11/umi5', (_, response) => {
        return response.json(valoresUmi5);
    });
}

(async () => {
    const valoresTemp1 = [];
    const valoresTemp2 = [];
    const valoresTemp3 = [];
    const valoresTemp4= [];
    const valoresTemp5 = [];
    const valoresUmi1 = [];
    const valoresUmi2 = [];
    const valoresUmi3 = [];
    const valoresUmi4 = [];
    const valoresUmi5 = [];
    await serial(
        valoresTemp1,
        valoresTemp2,
        valoresTemp3,
        valoresTemp4,
        valoresTemp5,
        valoresUmi1,
        valoresUmi2,
        valoresUmi3,
        valoresUmi4,
        valoresUmi5
    );
    servidor(
        valoresTemp1,
        valoresTemp2,
        valoresTemp3,
        valoresTemp4,
        valoresTemp5,
        valoresUmi1,
        valoresUmi2,
        valoresUmi3,
        valoresUmi4,
        valoresUmi5
    );
})();
