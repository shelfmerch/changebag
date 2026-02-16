# Test script for ending a campaign in PowerShell

# Base URL
$BASE_URL = "http://localhost:5000"

# Replace with a valid sponsorship ID and auth token
$SPONSORSHIP_ID = "YOUR_SPONSORSHIP_ID"
$AUTH_TOKEN = "YOUR_AUTH_TOKEN"

Write-Host "Testing End Campaign Functionality" -ForegroundColor Yellow
Write-Host "=================================="

# Test: End Campaign
Write-Host "Test: Ending Campaign with ID: $SPONSORSHIP_ID" -ForegroundColor Yellow

try {
    $endCampaignResponse = Invoke-RestMethod -Uri "$BASE_URL/api/sponsorships/$SPONSORSHIP_ID/end-campaign" `
        -Method PATCH `
        -Headers @{
            "Authorization" = "Bearer $AUTH_TOKEN"
            "Content-Type" = "application/json"
        } `
        -ErrorAction Stop

    Write-Host "Response:" -ForegroundColor Cyan
    $endCampaignResponse | ConvertTo-Json -Depth 5
    
    Write-Host "✓ Campaign ended successfully" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to end campaign" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    
    # Try to extract more error details
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "==================================" 
Write-Host "Testing Complete" -ForegroundColor Yellow