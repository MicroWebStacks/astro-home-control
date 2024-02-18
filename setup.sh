sudo cp astro.service /lib/systemd/system/
sudo chmod 644 /lib/systemd/system/astro.service
sudo chmod +x /home/wass/websites/astro-home-control/server/server.js
sudo systemctl daemon-reload
sudo systemctl enable astro.service
sudo systemctl start astro.service
