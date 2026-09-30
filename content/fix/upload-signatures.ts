import type { UploadSignature, UsbDevice } from '@/lib/fix/upload-diagnosis';

/**
 * Known upload failures. Each `pattern` is matched against the text a student
 * pastes from the Arduino IDE output pane (avrdude for AVR boards, esptool for
 * ESP32). Causes are ordered most likely first; steps are one action each.
 *
 * Sources: Arduino Help Center ("Error: avrdude when uploading"), the avrdude
 * source for the exact message strings, and Espressif's esptool
 * troubleshooting guide. Add real log excerpts to `examples`; a test checks
 * every one still matches its own signature.
 */
export const UPLOAD_SIGNATURES: UploadSignature[] = [
  {
    id: 'avr-not-in-sync',
    title: 'The board is not answering the uploader',
    meaning:
      'The IDE reached the port but the board never replied like a bootloader. This is the most common Arduino upload error.',
    pattern: 'stk500_getsync\\(\\)|stk500_recv\\(\\): programmer is not responding',
    priority: 90,
    family: 'avr',
    causes: [
      'The selected board or processor does not match the board in your hand (clone Nanos often need "Old Bootloader").',
      'The wrong port is selected.',
      'Something is connected to pin 0 (RX) or pin 1 (TX) and is fighting the upload.',
      'The USB cable only charges and does not carry data, or is faulty.',
      'The board has no working bootloader.',
    ],
    steps: [
      { text: 'Open Tools > Board and check it is the board in your hand (Uno, Nano, Mega are different).' },
      { text: 'On a Nano, open Tools > Processor and pick "ATmega328P (Old Bootloader)", then upload again.' },
      { text: 'Open Tools > Port and pick the port that appears only when the board is plugged in. Unplug and replug to see which one it is.' },
      { text: 'Pull every wire off pins 0 and 1 (RX and TX), then upload again.', physical: true },
      { text: 'Swap the USB cable for one you know carries data, and try another USB port.', physical: true },
      { text: 'If it still fails on another computer, the bootloader may be missing or damaged. Ask your instructor or re-burn it with a programmer.' },
    ],
    examples: [
      'avrdude: stk500_recv(): programmer is not responding\navrdude: stk500_getsync() attempt 1 of 10: not in sync: resp=0x00',
      'avrdude: stk500_getsync() attempt 10 of 10: not in sync: resp=0x30',
    ],
  },
  {
    id: 'avr-mega-timeout',
    title: 'The Mega-style uploader timed out',
    meaning:
      'This message comes from the uploader used for the Mega 2560. It usually means the IDE is set to a Mega but the board is not, or the other way around.',
    pattern: 'stk500v2_(ReceiveMessage|getsync)\\(\\)',
    priority: 90,
    family: 'avr',
    causes: [
      'The selected board does not match the board (Mega selected on an Uno, or the reverse).',
      'The wrong port is selected.',
      'The USB cable does not carry data, or the board is not powered.',
    ],
    steps: [
      { text: 'Open Tools > Board and choose the exact board printed on yours.' },
      { text: 'Open Tools > Port and pick the port that appears when the board is plugged in.' },
      { text: 'Try another USB cable and another USB port.', physical: true },
    ],
    examples: [
      'avrdude: stk500v2_ReceiveMessage(): timeout',
      'avrdude: stk500v2_getsync(): timeout communicating with programmer',
    ],
  },
  {
    id: 'avr-invalid-signature',
    title: 'The chip on the board is not the chip the IDE expects',
    meaning:
      'The uploader reached a chip but its ID did not match the selected board. A signature of 000000 or FFFFFF means it could not talk to a chip at all.',
    pattern: 'invalid device signature|expected signature for',
    priority: 95,
    family: 'avr',
    causes: [
      'The selected board or processor is wrong for this chip.',
      'The chip is not powered or not connected (signature 000000 or FFFFFF).',
      'A clone board uses a different but compatible chip.',
    ],
    steps: [
      { text: 'Read the log line "Expected signature for ..." and compare it with the chip printed on your board.' },
      { text: 'Open Tools > Board and Tools > Processor and pick the exact match.' },
      { text: 'If the signature reads 000000 or FFFFFF, check the board is powered and re-seat the USB cable.', physical: true },
    ],
    examples: [
      'avrdude: Yikes!  Invalid device signature.\n         Double check connections and try again, or use -F to override\n         this check.',
      'avrdude: Expected signature for ATmega328P is 1E 95 0F',
    ],
  },
  {
    id: 'port-busy-windows',
    title: 'Something else is holding the serial port',
    meaning:
      'The port exists but Windows will not let the uploader open it because another program already has it.',
    pattern: '(com\\d+|ser_open|serial).*access is denied',
    priority: 92,
    family: 'any',
    causes: [
      'The Serial Monitor or Serial Plotter is open.',
      'Another program (a second IDE window, PuTTY, a Python script) has the port open.',
      'A previous upload left the port locked.',
    ],
    steps: [
      { text: 'Close the Serial Monitor and Serial Plotter, then upload again.' },
      { text: 'Close any other program that talks to the board (another Arduino IDE window, PuTTY, a script).' },
      { text: 'Unplug the board, wait three seconds, plug it back in and pick the port again.', physical: true },
      { text: 'If it still fails, restart the Arduino IDE.' },
    ],
    examples: [
      'avrdude: ser_open(): can\'t open device "\\\\.\\COM3": Access is denied.',
      "serial.serialutil.SerialException: could not open port 'COM4': PermissionError(13, 'Access is denied.', None, 5)",
    ],
  },
  {
    id: 'port-missing',
    title: 'The port the IDE is using no longer exists',
    meaning:
      'The IDE remembered a port (like COM5) that is not there now. The board was unplugged, reset, or the driver is missing.',
    pattern: 'can\'t open device.*(cannot find the file|no such file)',
    priority: 92,
    family: 'any',
    causes: [
      'The board was unplugged or reset, so the port number changed.',
      'The USB-serial driver (often CH340 on clone boards) is not installed.',
      'On Linux, a background service such as brltty is grabbing the port.',
    ],
    steps: [
      { text: 'Unplug and replug the board, then reopen Tools > Port and pick the new port.', physical: true },
      { text: 'On Windows, open Device Manager > Ports (COM & LPT). If the board shows under "Other devices" or with a warning icon, install the driver for its USB chip (CH340 on most clones).' },
      { text: 'On Linux, if the port appears and then vanishes, remove the brltty service (sudo apt remove brltty) and replug.' },
    ],
    examples: [
      'avrdude: ser_open(): can\'t open device "\\\\.\\COM5": The system cannot find the file specified.',
      "avrdude: ser_open(): can't open device \"/dev/ttyUSB0\": No such file or directory",
    ],
  },
  {
    id: 'port-permission-linux',
    title: 'Your user is not allowed to use the serial port',
    meaning:
      'On Linux and macOS the serial device belongs to a group your user is not in.',
    pattern: '(can\'t open device|could not open port).*permission denied|\\[errno 13\\]',
    priority: 92,
    family: 'any',
    causes: [
      'Your user is not in the dialout group (uucp on Arch).',
      'A udev rule is missing for the board.',
    ],
    steps: [
      { text: 'Run: sudo usermod -a -G dialout $USER' },
      { text: 'Log out and log back in (or reboot) so the group change takes effect.' },
      { text: 'Replug the board and upload again.', physical: true },
    ],
    examples: [
      'avrdude: ser_open(): can\'t open device "/dev/ttyUSB0": Permission denied',
      "serial.serialutil.SerialException: [Errno 13] could not open port /dev/ttyUSB0: [Errno 13] Permission denied: '/dev/ttyUSB0'",
    ],
  },
  {
    id: 'esp32-no-header',
    title: 'The ESP32 is not in download mode',
    meaning:
      'The uploader is talking to the port but the ESP32 is not listening, usually because it was not put into download mode.',
    pattern: 'timed out waiting for packet header|failed to connect to esp32.*no serial data received',
    priority: 90,
    family: 'esp32',
    causes: [
      'The chip is not in download mode when the upload starts.',
      'The USB cable only charges and does not carry data.',
      'Something is wired to GPIO0, GPIO2, GPIO12, TX or RX and is holding it at the wrong level during reset.',
      'The USB port cannot supply enough power.',
    ],
    steps: [
      { text: 'Start the upload. When the log shows "Connecting......", hold the BOOT button, tap EN (reset), and release BOOT once the upload starts.', physical: true },
      { text: 'Use a USB cable you know carries data, plugged straight into the computer (not a hub).', physical: true },
      { text: 'Unplug anything wired to GPIO0, GPIO2, GPIO12, TX and RX, then try again.', physical: true },
      { text: 'If your board has no BOOT button and it keeps failing, Espressif documents a 10 µF capacitor between EN and GND as a fix.', physical: true },
    ],
    examples: [
      'A fatal error occurred: Failed to connect to ESP32: Timed out waiting for packet header',
      'A fatal error occurred: Failed to connect to ESP32: No serial data received.',
    ],
  },
  {
    id: 'esp32-wrong-boot',
    title: 'The ESP32 booted normally instead of into download mode',
    meaning:
      'The uploader reached the chip but it had started running your sketch (or was held in the wrong boot mode) instead of waiting for new firmware.',
    pattern: 'wrong boot mode detected',
    priority: 95,
    family: 'esp32',
    causes: [
      'GPIO0 was not pulled low when the board reset.',
      'A part wired to GPIO0 or GPIO12 is changing the boot mode.',
      'The board has no auto-reset circuit and needs the buttons pressed by hand.',
    ],
    steps: [
      { text: 'Hold BOOT, press and release EN (reset) while still holding BOOT, then release BOOT after the log shows the upload writing.', physical: true },
      { text: 'Unplug anything wired to GPIO0 and GPIO12, then try again.', physical: true },
      { text: 'Try another USB cable and port.', physical: true },
    ],
    examples: [
      'A fatal error occurred: Failed to connect to ESP32: Wrong boot mode detected (0x13)! The chip needs to be in download mode.',
    ],
  },
  {
    id: 'esp32-stopped',
    title: 'The ESP32 stopped responding mid-upload',
    meaning:
      'The upload started and then the chip went quiet. This is almost always power or the cable, not your code.',
    pattern: 'the chip stopped responding',
    priority: 90,
    family: 'esp32',
    causes: [
      'The USB port or cable cannot supply enough current, so the chip browned out.',
      'The upload speed is too high for the cable.',
      'Motors, servos or relays on the board are drawing power during upload.',
    ],
    steps: [
      { text: 'In Tools, lower Upload Speed to 115200 and upload again.' },
      { text: 'Unplug motors, servos, relays and other high-current parts from the board during upload.', physical: true },
      { text: 'Use a shorter, thicker USB cable plugged straight into the computer.', physical: true },
    ],
    examples: ['A fatal error occurred: The chip stopped responding.'],
  },
  {
    id: 'avr-verify-mismatch',
    title: 'The upload finished but the board disagrees with the file',
    meaning:
      'The uploader wrote the program and read it back, and the two did not match. That points at a flaky connection, not your code.',
    pattern: 'verification error, first mismatch at byte',
    priority: 60,
    family: 'avr',
    causes: [
      'A loose or poor-quality USB cable.',
      'Unstable power during the upload.',
      'A faulty board.',
    ],
    steps: [
      { text: 'Swap the USB cable and upload again.', physical: true },
      { text: 'Unplug everything except the USB cable from the board, then upload again.', physical: true },
      { text: 'If it keeps happening on every cable and computer, the board may be faulty.' },
    ],
    examples: ['avrdude: verification error, first mismatch at byte 0x0000\n         0x00 != 0xff'],
  },
];

/** Shown when a pasted log matches nothing: the checks that fix most uploads. */
export const GENERIC_UPLOAD_CHECKLIST: string[] = [
  'Check Tools > Board matches the board in your hand.',
  'Check Tools > Port shows a port that appears only when the board is plugged in.',
  'Swap the USB cable for one you know carries data (many cables only charge).',
  'Close the Serial Monitor, then upload again.',
  'Unplug anything wired to pins 0 and 1 (Uno/Nano) or to TX/RX and GPIO0 (ESP32).',
  'If the port never appears, install the driver for your board\'s USB chip (CH340 on most clones).',
];

/**
 * USB vendor:product IDs of adapters common on student boards. Web Serial only
 * reports these two numbers, so this table is how the tool names the chip.
 * Values are from the public usb.ids registry; add new adapters as students
 * report them.
 */
export const USB_DEVICES: UsbDevice[] = [
  {
    vid: 0x1a86,
    pid: 0x7523,
    chip: 'CH340',
    family: 'avr',
    usuallyOn: 'clone Arduino Uno and Nano boards, and many ESP32 dev boards',
    driverNeeded: true,
    hints: [
      'CH340 boards need a separate driver on Windows and macOS. If the port only shows up after installing the driver, that was the problem.',
      'On a clone Nano, choose Tools > Processor > ATmega328P (Old Bootloader).',
    ],
  },
  {
    vid: 0x1a86,
    pid: 0x55d4,
    chip: 'CH9102',
    family: 'esp32',
    usuallyOn: 'newer ESP32 dev boards',
    driverNeeded: true,
    hints: ['CH9102 boards need the WCH driver on Windows and macOS, the same as the CH340.'],
  },
  {
    vid: 0x10c4,
    pid: 0xea60,
    chip: 'CP210x',
    family: 'esp32',
    usuallyOn: 'ESP32 DevKit V1 and many ESP8266 boards',
    driverNeeded: true,
    hints: ['CP210x boards need the Silicon Labs driver on Windows and macOS.'],
  },
  {
    vid: 0x0403,
    pid: 0x6001,
    chip: 'FTDI FT232',
    family: 'avr',
    usuallyOn: 'older Arduino boards and FTDI serial adapters',
    driverNeeded: false,
    hints: ['FTDI drivers are usually installed automatically. If the port is missing, try another cable.'],
  },
  {
    vid: 0x2341,
    pid: 0x0043,
    chip: 'ATmega16U2 (Arduino Uno R3)',
    family: 'avr',
    usuallyOn: 'an official Arduino Uno R3',
    driverNeeded: false,
    hints: ['An official Uno needs no extra driver. Select "Arduino Uno" under Tools > Board.'],
  },
  {
    vid: 0x2341,
    pid: 0x0042,
    chip: 'ATmega16U2 (Arduino Mega 2560 R3)',
    family: 'avr',
    usuallyOn: 'an official Arduino Mega 2560 R3',
    driverNeeded: false,
    hints: ['Select "Arduino Mega or Mega 2560" under Tools > Board.'],
  },
  {
    vid: 0x2a03,
    pid: 0x0043,
    chip: 'ATmega16U2 (Arduino.org Uno)',
    family: 'avr',
    usuallyOn: 'an Arduino Uno sold by Arduino.org',
    driverNeeded: false,
    hints: ['Select "Arduino Uno" under Tools > Board.'],
  },
  {
    vid: 0x303a,
    pid: 0x1001,
    chip: 'ESP32 native USB (Espressif)',
    family: 'esp32',
    usuallyOn: 'ESP32-S3 and ESP32-C3 boards using the built-in USB port',
    driverNeeded: false,
    hints: [
      'Native USB boards enter download mode differently from older ESP32s: hold BOOT, tap RESET, release BOOT.',
      'Enable "USB CDC On Boot" in Tools if the Serial Monitor stays blank.',
    ],
  },
];
