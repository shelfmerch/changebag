#!/bin/bash
 
# Run the sponsorship migration script
echo "Running sponsorship migration..."
cd server
node src/scripts/updateSponsorships.js 