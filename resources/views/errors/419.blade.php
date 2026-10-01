<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Session Expired - TanganakDusun</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .error-container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 500px;
            width: 100%;
            padding: 40px;
            text-align: center;
        }

        .error-icon {
            width: 120px;
            height: 120px;
            margin: 0 auto 30px;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 60px;
            color: white;
            animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }

        h1 {
            color: #2d3748;
            font-size: 28px;
            margin-bottom: 16px;
            font-weight: 700;
        }

        .error-code {
            color: #a0aec0;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 20px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        p {
            color: #4a5568;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 30px;
        }

        .button-group {
            display: flex;
            gap: 12px;
            justify-content: center;
            flex-wrap: wrap;
        }

        .btn {
            padding: 12px 24px;
            border-radius: 10px;
            font-size: 15px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.3s ease;
            cursor: pointer;
            border: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }

        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }

        .btn-secondary {
            background: #e2e8f0;
            color: #4a5568;
        }

        .btn-secondary:hover {
            background: #cbd5e0;
            transform: translateY(-2px);
        }

        .info-box {
            background: #f7fafc;
            border-left: 4px solid #667eea;
            padding: 16px;
            margin-top: 30px;
            text-align: left;
            border-radius: 8px;
        }

        .info-box strong {
            color: #2d3748;
            display: block;
            margin-bottom: 8px;
            font-size: 14px;
        }

        .info-box ul {
            list-style: none;
            padding-left: 0;
        }

        .info-box li {
            color: #4a5568;
            font-size: 14px;
            margin-bottom: 6px;
            padding-left: 20px;
            position: relative;
        }

        .info-box li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #667eea;
            font-weight: bold;
        }

        @media (max-width: 480px) {
            .error-container {
                padding: 30px 20px;
            }

            h1 {
                font-size: 24px;
            }

            .button-group {
                flex-direction: column;
            }

            .btn {
                width: 100%;
                justify-content: center;
            }
        }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="error-icon">⏰</div>

        <div class="error-code">Error 419</div>
        <h1>Your Session Has Expired</h1>

        <p>
            For your security, your session has timed out. This happens when you leave the page open for too long or if your browser security settings cleared the session.
        </p>

        <div class="button-group">
            <button onclick="window.location.reload()" class="btn btn-primary">
                🔄 Refresh Page
            </button>
            <a href="{{ url('/') }}" class="btn btn-secondary">
                🏠 Go Home
            </a>
        </div>

        <div class="info-box">
            <strong>Why did this happen?</strong>
            <ul>
                <li>You were inactive for too long</li>
                <li>Your browser cleared the security token</li>
                <li>You opened the page in multiple tabs</li>
            </ul>
        </div>
    </div>

    <script>
        // Auto-refresh after 5 seconds if user doesn't click
        setTimeout(function() {
            if (confirm('Session expired. Refresh the page?')) {
                window.location.reload();
            }
        }, 5000);
    </script>
</body>
</html>
