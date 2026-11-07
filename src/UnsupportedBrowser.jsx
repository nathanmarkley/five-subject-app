export default function UnsupportedBrowser() {
  return (
    <div className="unsupported-screen">
      <div className="welcome-content">
        <img
          className="welcome-logo"
          src="/icons/icon-192.png"
          width="64"
          height="64"
          alt=""
        />
        <h1 className="welcome-title">
          Five Subject Notebook
          <span className="welcome-title-sub">
            needs a browser that can save files to your device
          </span>
        </h1>
        <p className="welcome-sub">
          Please open this on a desktop or laptop using Chrome or Edge.
        </p>
        <p className="welcome-hint">
          Brave users: paste <code>brave://flags/#file-system-access-api</code> into
          the address bar, set it to Enabled, then relaunch.
        </p>
      </div>
    </div>
  )
}