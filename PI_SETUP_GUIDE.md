# Raspberry Pi 3 Dashboard Setup Guide

This guide covers how to set up your Raspberry Pi 3 hardware and configure the software to run the Command Center dashboard automatically in a fullscreen, kiosk mode.

## 1. Hardware Requirements

*   **Raspberry Pi 3** (Model B or B+)
*   **MicroSD Card** (16GB or 32GB recommended, Class 10)
*   **Power Supply** (Official Raspberry Pi 5.1V 2.5A recommended to avoid voltage warnings)
*   **Monitor Connection**:
    *   *Option A*: Standard HDMI cable
    *   *Option B (Dual-Setup)*: HDMI to VGA adapter (if you are sharing a monitor with your main PC using HDMI for the PC and VGA for the Pi)
*   **Keyboard & Mouse** (for initial setup)

## 2. Operating System Installation

1.  Download the [Raspberry Pi Imager](https://www.raspberrypi.com/software/) on your main PC.
2.  Insert your MicroSD card into your PC.
3.  Open the Imager and click **Choose OS**.
    *   Select **Raspberry Pi OS (32-bit)** (The standard version with desktop environment. Do *not* choose Lite, as we need a browser to display the dashboard).
4.  Click **Choose Storage** and select your MicroSD card.
5.  Click the **Gear Icon (Advanced Options)** before writing:
    *   Set hostname (e.g., `ajay-pi3`).
    *   Enable SSH (use password authentication).
    *   Set username and password (e.g., `pi` and your password).
    *   Configure Wireless LAN (enter your Wi-Fi details so the Pi connects automatically).
6.  Click **Write**. Once finished, insert the MicroSD card into the Pi and power it on.

## 3. Initial Software Setup

Once the Pi boots up and is connected to the internet, open the Terminal (or SSH into it from your PC) and run the following commands to update the system and install required tools:

```bash
# Update the system
sudo apt update && sudo apt upgrade -y

# Install git (to clone your repository) and unclutter (to hide the mouse cursor)
sudo apt install -y git unclutter

# Install Node.js (we will use a lightweight server to host the dashboard locally)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install a simple HTTP server globally
sudo npm install -g serve
```

## 4. Deploying the Dashboard

1.  Clone your project repository to the Pi:
    ```bash
    cd ~
    git clone https://github.com/person1789/dashboard.git
    ```
    *(Note: adjust the GitHub URL to match exactly where you pushed your code).*

2.  Test the server manually:
    ```bash
    cd ~/dashboard
    serve -s . -p 8080
    ```
    Open Chromium on the Pi and go to `http://localhost:8080`. You should see your dashboard.

## 5. Configuring Auto-Start (Kiosk Mode)

We want the Pi to automatically start the server and open the Chromium browser in fullscreen (kiosk) mode immediately after booting, without showing the desktop.

1.  Create a startup script:
    ```bash
    nano ~/start_dashboard.sh
    ```
    
2.  Add the following lines to the script:
    ```bash
    #!/bin/bash
    
    # Start the local web server in the background
    cd /home/pi/dashboard
    serve -s . -p 8080 &
    
    # Wait a few seconds for the server to start
    sleep 5
    
    # Hide the mouse cursor after 0.5 seconds of inactivity
    unclutter -idle 0.5 -root &
    
    # Launch Chromium in kiosk mode
    chromium-browser --noerrdialogs --disable-infobars --kiosk http://localhost:8080
    ```

3.  Make the script executable:
    ```bash
    chmod +x ~/start_dashboard.sh
    ```

4.  Tell the Pi to run this script on boot. We will edit the autostart file for the LXDE desktop environment:
    ```bash
    sudo nano /etc/xdg/lxsession/LXDE-pi/autostart
    ```

5.  Modify the file to look exactly like this (comment out the screen saver, and add our script at the end):
    ```text
    @lxpanel --profile LXDE-pi
    @pcmanfm --desktop --profile LXDE-pi
    #@xscreensaver -no-splash
    @xset s off
    @xset -dpms
    @xset s noblank
    @/home/pi/start_dashboard.sh
    ```
    *(The `xset` commands prevent the screen from going to sleep or blanking out).*

6.  Save (`Ctrl+O`, `Enter`) and exit (`Ctrl+X`).

## 6. Reboot & Test

Reboot your Raspberry Pi:
```bash
sudo reboot
```

When it turns back on, it should connect to Wi-Fi, start the local server, and launch your Command Center dashboard in full screen! 

### Updating the Dashboard
When you make changes to the code on your main PC and push them to GitHub, simply SSH into your Pi and pull the latest changes:
```bash
ssh pi@ajay-pi3.local
cd ~/dashboard
git pull origin main
```
Then refresh the Chromium page using `Ctrl+F5` (or reboot the Pi).
