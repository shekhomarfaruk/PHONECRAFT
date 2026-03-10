Stop-Process -Name ngrok -Force -ErrorAction SilentlyContinue
$conn = Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue | Select-Object -First 1
if ($conn) {
    $p = $conn.OwningProcess
    if ($p -gt 0) { Stop-Process -Id $p -Force -ErrorAction SilentlyContinue }
}
Start-Sleep -Seconds 2
Start-Process -FilePath "node" -ArgumentList "server/index.js" -WorkingDirectory "a:\app fon" -WindowStyle Hidden
Start-Sleep -Seconds 2
Start-Process -FilePath "C:\Users\syadm\AppData\Roaming\npm\ngrok.cmd" -ArgumentList "http --url=birdless-jeanice-nonsidereal.ngrok-free.dev 4000" -WindowStyle Hidden -RedirectStandardOutput "a:\app fon\ngrok.log" -RedirectStandardError "a:\app fon\ngrok-err.log"
Write-Output "Server and ngrok started"
