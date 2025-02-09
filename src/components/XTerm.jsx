import React, { useEffect, useRef } from 'react';

export default function XTerm() {
  const terminalRef = useRef(null);

  useEffect(() => {
    // Dynamic imports to ensure client-side only
    const loadTerminal = async () => {
      const { Terminal } = await import('@xterm/xterm');
      const { FitAddon } = await import('@xterm/addon-fit');
      await import('@xterm/xterm/css/xterm.css');

      const term = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        theme: {
          background: '#1a1b26',
          foreground: '#a9b1d6',
          cursor: '#f7768e',
          selection: '#28292f',
          black: '#32344a',
          blue: '#7aa2f7',
          cyan: '#7dcfff',
          green: '#9ece6a',
          magenta: '#ad8ee6',
          red: '#f7768e',
          white: '#787c99',
          yellow: '#e0af68'
        },
      });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);

      if (terminalRef.current) {
        term.open(terminalRef.current);
        setTimeout(() => fitAddon.fit(), 100);

        term.writeln('\x1b[1;35m=== Welcome to My Interactive Terminal Portfolio! ===\x1b[0m');
        term.writeln('\x1b[36mDon\'t worry if you\'re new to terminals - it\'s easy to use!\x1b[0m');
        term.writeln('\x1b[36mJust type a command and press Enter. For example:\x1b[0m');
        term.writeln('\x1b[33m1. Type "help" to see all available commands\x1b[0m');
        term.writeln('\x1b[33m2. Type "about" to learn about me\x1b[0m');
        term.writeln('\x1b[33m3. Type "clear" to clear the screen\x1b[0m');
        term.writeln('\x1b[36m\nReady to start? Type a command below:\x1b[0m');
        term.write('\x1b[32m$ \x1b[0m');

        let currentLine = '';

        term.onData(e => {
          switch (e) {
            case '\r': // Enter
              term.write('\r\n');
              handleCommand(currentLine.trim(), term);
              currentLine = '';
              term.write('\x1b[32m$ \x1b[0m');
              break;
            case '\u007F': // Backspace
              if (currentLine.length > 0) {
                currentLine = currentLine.slice(0, -1);
                term.write('\b \b');
              }
              break;
            default:
              currentLine += e;
              term.write(e);
          }
        });

        const handleCommand = (command, term) => {
          switch (command.toLowerCase()) {
            case 'help':
              term.writeln('\x1b[1;36mAvailable Commands:\x1b[0m');
              term.writeln('- help     : Show this help message');
              term.writeln('- about    : Learn about me');
              term.writeln('- clear    : Clear the screen');
              term.writeln('- projects : View my projects');
              term.writeln('- contact  : Get my contact information');
              term.writeln('- skills   : List my technical skills');
              term.writeln('- whoami   : Display user information');
              break;

            case 'about':
              term.writeln('\x1b[1;36mAbout Me:\x1b[0m');
              term.writeln('I\'m Chenglong Wu, a graduate student in Computer Science');
              term.writeln('at Illinois Institute of Technology, specializing in');
              term.writeln('Software Engineering and AI.');
              break;

            case 'clear':
              term.clear();
              break;

            case 'projects':
              term.writeln('\x1b[1;36mMy Projects:\x1b[0m');
              term.writeln('1. License Plate Detection System');
              term.writeln('2. Portfolio Website');
              term.writeln('3. Reinforcement Learning Projects');
              break;

            case 'contact':
              term.writeln('\x1b[1;36mContact Information:\x1b[0m');
              term.writeln('Email: clwuyang@gmail.com');
              term.writeln('LinkedIn: linkedin.com/in/cwuyang');
              term.writeln('GitHub: github.com/clwuyang');
              break;

            case 'skills':
              term.writeln('\x1b[1;36mTechnical Skills:\x1b[0m');
              term.writeln('Languages: Python, JavaScript, Java, C++');
              term.writeln('Frameworks: React, Node.js, TensorFlow');
              term.writeln('Tools: Git, Docker, AWS');
              break;

            case 'whoami':
              term.writeln('\x1b[1;36mUser Information:\x1b[0m');
              term.writeln('Name: Chenglong Wu');
              term.writeln('Role: Graduate Student / Software Engineer');
              term.writeln('Location: Bilbao, Spain');
              break;

            case '':
              break;

            default:
              term.writeln(`Command not found: ${command}`);
              term.writeln('Type "help" for available commands');
          }
        };

        const handleResize = () => {
          fitAddon.fit();
        };

        window.addEventListener('resize', handleResize);
        return () => {
          window.removeEventListener('resize', handleResize);
          term.dispose();
        };
      }
    };

    loadTerminal();
  }, []);

  return <div ref={terminalRef} className="w-full h-[80vh] rounded-lg overflow-hidden border border-gray-700" />;
} 