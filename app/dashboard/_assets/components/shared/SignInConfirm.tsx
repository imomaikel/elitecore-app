import Link from 'next/link';

const SignInConfirm = () => {
  return (
    <div>
      By continuing, you agree that our website will use your browser and IP to send requests to API service at{' '}
      <Link className="underline mx-0.5" href={'https://www.tebex.io/'} target="_blank">
        tebex.io
      </Link>
      for improved functionality.
    </div>
  );
};

export default SignInConfirm;
