export default function TestEnv() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Test</h1>
      <div className="bg-gray-100 p-4 rounded-md">
        <pre className="text-sm">
          {JSON.stringify({
            hasUPLOADTHING_SECRET: !!process.env.UPLOADTHING_SECRET,
            hasUPLOADTHING_APP_ID: !!process.env.UPLOADTHING_APP_ID,
            hasUPLOADTHING_TOKEN: !!process.env.UPLOADTHING_TOKEN,
            hasNEXT_PUBLIC_UPLOADTHING_URL: !!process.env.NEXT_PUBLIC_UPLOADTHING_URL,
          }, null, 2)}
        </pre>
      </div>
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Environment Variables:</h2>
        <ul className="space-y-2">
          {Object.entries(process.env)
            .filter(([key]) => key.includes('UPLOADTHING') || key.includes('NEXT_PUBLIC'))
            .map(([key, value]) => (
              <li key={key} className="text-sm">
                <span className="font-mono font-bold">{key}</span>:{' '}
                <span className="text-gray-700">
                  {key.includes('SECRET') || key.includes('TOKEN') 
                    ? '••••••••' 
                    : value || 'Not set'}
                </span>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
