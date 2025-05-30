namespace MotionKit {

    export enum DistanceUnit {
        //% blockId=motionkit_DistanceUnitCentimeters block="cm"
        Centimeters,
    }

    export enum Servos {
        //% blockId="motionkit_ServoS1" block="S1"
        S1 = 0,
        //% blockId="motionkit_ServoS2" block="S2"
        S2 = 1
    }

    export enum Motors {
        //% blockId="motionkit_MotorLeft" block="links"
        M1 = 0,
        //% blockId="motionkit_MotorRight" block="rechts"
        M2 = 1,
        //% blockId="motionkit_MotorAll" block="beide"
        All = 2
    }

    export enum Dir {
        //% blockId="motionkit_DirCW" block="vorwärts"
        CW = 0,
        //% blockId="motionkit_DirCCW" block="rückwärts"
        CCW = 1
    }

    export enum Led {
        //% blockId="motionkit_LedLeft" block="links"
        LedLeft = 0,
        //% blockId="motionkit_LedRight" block="rechts"
        LedRight = 1,
        //% blockId="motionkit_LedAll" block="beide"
        LedAll = 2
    }

    export enum LedSwitch {
        //% blockId="motionkit_LedOn" block="AN"
        LedOn = 1,
        //% blockId="motionkit_LedOff" block="AUS"
        LedOff = 0
    }

    export enum Patrol {
        //% blockId="motionkit_PatrolLeft" block="links"
        PatrolLeft = 0,
        //% blockId="motionkit_PatrolRight" block="rechts"
        PatrolRight = 1
    }

    export enum Brightness {
        //% blockId="motionkit_Bright" block="hell"
        Bright = 0,
        //% blockId="motionkit_Dark" block="dunkel"
        Dark = 1
    }

    export enum Voltage {
        //% blockId="motionkit_High" block="high"
        High = 1,
        //% blockId="motionkit_Low"block="low"
        Low = 0
    }


    const IICADRRESS = 0x10;

    let irFlag = 0;
    let ltFlag = 0;
    let ltStatus = 0;

    let irCallback: (message: number) => void = null;
    let ltCallback: Action = null;


    /**
     * Read ultrasonic sensor.
     */

    //% weight=95
    //% blockId=motionkit_ultrasonic block="Ultraschallsensor |%unit "
    export function ultrasonic(unit: DistanceUnit, maxCmDistance = 500): number {
        let integer = readData(0x28, 2);
        let distance = integer[0] << 8 | integer[1];
        return (distance > 399 || distance < 1) ? -1 : distance;
    }

    /**
     * Set the MotionKit servos.
     */

    //% weight=90
    //% blockId=motionkit_servoRun block="Servo|%index|Winkel|%angle"
    //% angle.shadow="protractorPicker"
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=2
    export function servoRun(index: Servos, angle: number): void {
        if (index == Servos.S1) {
            writeData([0x14, angle]);
        } else if (index == Servos.S2) {
            writeData([0x15, angle]);
        } else {
            writeData([0x14, angle]);
            writeData([0x15, angle]);
        }
    }

    /**
     * Set the direction and speed of MotionKit motor.
     */

    //% weight=85
    //% blockId=motionkit_motorRun block="Motor|%index|Richtung|%direction|Tempo|%speed"
    //% speed.min=0 speed.max=255 speed.defl=200
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=2
    //% direction.fieldEditor="gridpicker" direction.fieldOptions.columns=2
    export function motorRun(index: Motors, direction: Dir, speed: number): void {
        if (index == Motors.M1) {
            writeData([0x00, direction, speed]);
        } else if (index == Motors.M2) {
            writeData([0x02, direction, speed]);
        } else {
            writeData([0x00, direction, speed]);
            writeData([0x02, direction, speed]);
        }
    }

    /**
     * Stop the MotionKit motor.
     */

    //% weight=80
    //% blockId=motionkit_motorStop block="Motor |%motors anhalten"
    //% motors.fieldEditor="gridpicker" motors.fieldOptions.columns=2 
    export function motorStop(index: Motors): void {
        if (index == Motors.M1) {
            writeData([0x00, 0, 0]);
        } else if (index == Motors.M2) {
            writeData([0x02, 0, 0]);
        } else {
            writeData([0x00, 0, 0]);
            writeData([0x02, 0, 0]);
        }
    }

    /**
     * Turn on/off the LEDs.
     */

    //% weight=75
    //% blockId=motionkit_writeLED block="LED |%led |%ledswitch"
    //% led.fieldEditor="gridpicker" led.fieldOptions.columns=2 
    //% ledswitch.fieldEditor="gridpicker" ledswitch.fieldOptions.columns=2
    export function writeLED(led: Led, ledswitch: LedSwitch): void {
        if (led == Led.LedLeft) {
            writeData([0x0B, ledswitch]);
        } else if (led == Led.LedRight) {
            writeData([0x0C, ledswitch]);
        } else {
            writeData([0x0B, ledswitch]);
            writeData([0x0C, ledswitch]);
        }
    }

    //% weight=74
    //% blockId=motionkit_setColor block="RGB-LED |%color"
    //% color.shadow="colorNumberPicker"
    export function setColor(color: number): void {
        writeData([0x18, (color >> 16) & 0xff]);
        writeData([0x19, (color >> 8) & 0xff]);
        writeData([0x1A, color & 0xff]);
    }

    //% weight=73
    //% blockId=motionkit_setRgb block="rot |%red grün |%green blau |%blue"
    //% red.min=0 red.max=255 red.defl=200
    //% green.min=0 green.max=255 green.defl=200
    //% blue.min=0 blue.max=255 blue.defl=200
    //% advanced=true
    export function setRgb(red: number, green: number, blue: number): number {
        return (red << 16) + (green << 8) + (blue);
    }

    /**
     * Read line tracking sensor.
     */

    //% weight=70
    //% blockId=motionkit_readPatrol block="Helligkeitssensor (Boden)|%patrol|%brightness"
    //% patrol.fieldEditor="gridpicker" patrol.fieldOptions.columns=2 
    //% brightness.fieldEditor="gridpicker" brightness.fieldOptions.columns=2
    export function readPatrol(patrol: Patrol, brightness: Brightness): boolean {
        let data = readData(0x1D, 1)[0];
        let sensorValue = 0;

        if (patrol == Patrol.PatrolLeft) {
            sensorValue = (data & 0x01) === 0 ? 0 : 1;
        } else if (patrol == Patrol.PatrolRight) {
            sensorValue = (data & 0x02) === 0 ? 0 : 1;
        }

        return brightness == Brightness.Bright ? sensorValue == 0 : sensorValue == 1;
    }

    /**
     * Read the version number.
     */

    //% weight=65
    //% blockId=motionkit_getVersion block="Versionsnummer"
    //% deprecated=true
    export function getVersion(): string {
        let dataLen = readData(0x32, 1)[0];
        let buf = readData(0x33, dataLen);
        let version = "";
        for (let index = 0; index < dataLen; index++) {
            version += String.fromCharCode(buf[index])
        }
        return version;
    }

    /**
     * Line tracking sensor event function
     */

    //% weight=60
    //% blockId=motionkit_ltEvent block="an|%value Linienfolger|%vi"
    //% advanced=true
    //% deprecated=true
    export function ltEvent(value: Patrol, vi: Voltage, ltcb: Action) {
        ltFlag = 1;
        ltCallback = ltcb;
        if (value == Patrol.PatrolLeft) {
            if (vi == Voltage.High) {
                ltStatus = 0x11;
            } else {
                ltStatus = 0x12;
            }
        } else {
            if (vi == Voltage.High) {
                ltStatus = 0x13;
            } else {
                ltStatus = 0x14;
            }
        }
    }

    /**
     * Get the value of the infrared sensor
     */

    //% weight=55
    //% blockId=motionkit_irRead block="IR Wert"
    export function irRead(): number {
        let buf2 = readData(0x2B, 4);
        let data2 = buf2[3] | (buf2[2] << 8) | (buf2[1] << 16) | (buf2[0] << 24);
        return irKeyValueConversion(data2);
    }

    /**
     * Infrared sensor event function
     */

    //% weight=50
    //% blockId=motionkit_irEvent block="Wenn IR empfangen"
    //% draggableParameters
    //% advanced=true
    export function irEvent(ircb: (message: number) => void) {
        irFlag = 1;
        irCallback = ircb;
    }

    function readData(reg: number, len: number): Buffer {
        pins.i2cWriteNumber(IICADRRESS, reg, NumberFormat.UInt8BE);
        return pins.i2cReadBuffer(IICADRRESS, len, false);
    }

    function writeData(buf: number[]): void {
        pins.i2cWriteBuffer(IICADRRESS, pins.createBufferFromArray(buf));
    }

    function irKeyValueConversion(data: number): number {
        let data1 = 0;
        switch (data) {
            case 0xFD00FF: data1 = 0; break;
            case 0xFD807F: data1 = 1; break;
            case 0xFD40BF: data1 = 2; break;
            case 0xFD20DF: data1 = 4; break;
            case 0xFDA05F: data1 = 5; break;
            case 0xFD609F: data1 = 6; break;
            case 0xFD10EF: data1 = 8; break;
            case 0xFD906F: data1 = 9; break;
            case 0xFD50AF: data1 = 10; break;
            case 0xFD30CF: data1 = 12; break;
            case 0xFDB04F: data1 = 13; break;
            case 0xFD708F: data1 = 14; break;
            case 0xFD08F7: data1 = 16; break;
            case 0xFD8877: data1 = 17; break;
            case 0xFD48B7: data1 = 18; break;
            case 0xFD28D7: data1 = 20; break;
            case 0xFDA857: data1 = 21; break;
            case 0xFD6897: data1 = 22; break;
            case 0xFD18E7: data1 = 24; break;
            case 0xFD9867: data1 = 25; break;
            case 0xFD58A7: data1 = 26; break;
            case 0: data1 = -1; break;
            default: data1 = data & 0xff; break;
        }
        return data1;
    }

    basic.forever(() => {
        if (irFlag == 1) {
            let buf3 = readData(0x2B, 4);
            let data3 = buf3[3] | (buf3[2] << 8) | (buf3[1] << 16) | (buf3[0] << 24);
            if (data3 != 0) {
                irCallback(irKeyValueConversion(data3));
            }
        }
        if (ltFlag == 1) {
            let data4 = readData(0x1D, 1)[0];
            switch (ltStatus) {
                case 0x11: if (data4 & 0x01) { ltCallback(); break }
                case 0x12: if (!(data4 & 0x01)) { ltCallback(); break }
                case 0x13: if (data4 & 0x02) { ltCallback(); break }
                case 0x14: if (!(data4 & 0x02)) { ltCallback(); break }
            }
        }
        basic.pause(100);
    })
}
