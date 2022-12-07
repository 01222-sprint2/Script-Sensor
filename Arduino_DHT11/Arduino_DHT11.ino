#include "DHT.h"
#define dht_type DHT11

int dht_pin = A0;
DHT dht_1 = DHT(dht_pin, dht_type);

//int lm35_pin = A1, leitura_lm35 = 0;
//float temperatura;
//float umidade;
//int ldr_pin = A2, leitura_ldr = 0;
//int switch_pin = 7;
void setup()
{
Serial.begin(9600);
dht_1.begin();
//pinMode(switch_pin, INPUT);
}
void loop()
{
float umidade = dht_1.readHumidity();
float temperatura = dht_1.readTemperature();
float tempProjeto = 0.81*temperatura+3.8;
float temp1 = tempProjeto * 0.90;
float temp2 = tempProjeto * 1.27;
float temp3 = tempProjeto * 1.14;
float temp4 = tempProjeto * 0.85;

float umiProjeto = 0.35 * umidade - 13.34;
float umi1 = umiProjeto * 0.9;
float umi2 = umiProjeto * 1.27;
float umi3 = umiProjeto * 1.14;
float umi4 = umiProjeto * 0.85;
if (isnan(temperatura) or isnan(umidade))
{
//Serial.println("Erro ao ler o DHT");
}
else
{

//5 dados diferentes para a temperatura
Serial.print(tempProjeto);
Serial.print(";");
Serial.print(temp1);
Serial.print(";");
Serial.print(temp2);
Serial.print(";");
Serial.print(temp3);
Serial.print(";");
Serial.print(temp4);
Serial.print(";");
Serial.print(umiProjeto);
Serial.print(";");
Serial.print(umi1);
Serial.print(";");
Serial.print(umi2);
Serial.print(";");
Serial.print(umi3);
Serial.print(";");
Serial.println(umi4);

}
/*** Bloco do LM35
*/
//leitura_lm35 = analogRead(lm35_pin);
//temperatura = leitura_lm35 * (5.0/1023) * 100;
//Serial.print(temperatura);
//Serial.println(";");

/**
* Bloco do LDR5
//*/
//leitura_ldr = analogRead(ldr_pin);
// Serial.print(leitura_ldr);

/**
* Bloco do TCRT5000
*/
//if(digitalRead(switch_pin) == LOW){
////Serial.println(1);
//}
//else {
//// Serial.println(0);
//}
//if (cont == 99) {
//  Serial.print("KBOU");
//}
delay(3000);

}

/*
TEMPERATURA
  30 = 32,26a + b
  20 = 20a + b
  10 = 12,26a
  a = 0,81

  20 = 20*(0,81) + b
  20 = 16,2 + b
  b = 3,8
==================================================
UMIDADE
  12 = 72,06a + b
  7 = 58a + b
  5 = 14,06a
  0,35 = a

  7 = 58*(0,35) + b
  7 = 20,3 + b
  b = -13,3
 */
