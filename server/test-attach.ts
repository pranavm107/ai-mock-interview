import Docker from 'dockerode';

const docker = new Docker();

async function run() {
  const container = await docker.createContainer({
    Image: 'python:3.12-alpine',
    Cmd: ['python', '-c', 'import sys; print("READ:", repr(sys.stdin.read()))'],
    OpenStdin: true,
    StdinOnce: true,
    AttachStdin: true,
    AttachStdout: true,
    AttachStderr: true,
  });

  const stream = await container.attach({
    stream: true,
    stdout: true,
    stderr: true,
    stdin: true,
    hijack: true
  });

  await container.start();
  
  stream.write(Buffer.from('HELLO BUFFER\\n'));
  stream.write('HELLO STRING\\n');
  stream.end();

  container.modem.demuxStream(stream, {
    write: (buf: Buffer) => console.log('STDOUT:', buf.toString())
  }, {
    write: (buf: Buffer) => console.log('STDERR:', buf.toString())
  });

  await container.wait();
  await container.remove();
}

run().catch(console.error);
