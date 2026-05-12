import re

# ============================================================
# 1. Update index.html
# ============================================================
with open(r'c:\Users\hp zbook\Desktop\LM\index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Fix Modal Inline Styles that force full screen on desktop
# We remove width:100%; height:100%; max-width:100%; border-radius:0; and background:var(--bg); if any
html = html.replace('style="width:100%; height:100%; max-width:100%; border-radius:0;"', '')
html = html.replace('style="width:100%; height:100%; max-width:100%; border-radius:0; background:var(--bg);"', '')

# The Account Avatar click was document.getElementById('avatar-upload').click()
# We will make sure the email in the account-modal can copy its text
old_email_row = """              <span style="font-size:15px; font-weight:600;">البريد الإلكتروني</span>
            </div>
            <span style="font-size:14px; color:var(--text3);" id="account-email-bot"></span>
          </div>"""

new_email_row = """              <span style="font-size:15px; font-weight:600;">البريد الإلكتروني</span>
            </div>
            <span style="font-size:14px; color:var(--text3); cursor:pointer;" id="account-email-bot" onclick="navigator.clipboard.writeText(this.innerText); UI.toast('تم نسخ البريد الإلكتروني', 'success');"></span>
          </div>"""
html = html.replace(old_email_row, new_email_row)

with open(r'c:\Users\hp zbook\Desktop\LM\index.html', 'w', encoding='utf-8') as f:
    f.write(html)

# ============================================================
# 2. Update css/style.css
# ============================================================
with open(r'c:\Users\hp zbook\Desktop\LM\css\style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Make the mobile header buttons transparent and floating (remove black circles)
old_circle = """/* Styling for the 3 top header icons on mobile to look like ChatGPT (black glowing circles) */
.mobile-header-circle-btn {
  width: 38px !important;
  height: 38px !important;
  border-radius: 50% !important;
  background: rgba(0, 0, 0, 0.5) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: #fff !important;
  padding: 0 !important;
  margin: 0 !important;
  box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.05), 0 2px 5px rgba(0,0,0,0.3) !important;
}"""

new_transparent = """/* Styling for the 3 top header icons on mobile to be transparent and floating */
.mobile-header-circle-btn {
  width: 38px !important;
  height: 38px !important;
  background: transparent !important;
  border: none !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: #fff !important;
  padding: 0 !important;
  margin: 0 !important;
  box-shadow: none !important;
}"""

if old_circle in css:
    css = css.replace(old_circle, new_transparent)
else:
    css += "\n" + new_transparent

# Add the sleek arrow for mobile search input and restrict modal size on desktop
custom_css = """
/* Modal constraints for desktop to prevent stretching */
@media (min-width: 769px) {
  .full-page-mobile {
    width: 100% !important;
    max-width: 480px !important;
    height: auto !important;
    max-height: 90vh !important;
    border-radius: 16px !important;
    margin: 0 auto !important;
    display: flex !important;
    flex-direction: column !important;
  }
}

/* Arrow pointing from search icon to search bar in mobile header */
#mobile-search-container {
  border-top: 1px solid rgba(255,255,255,0.05);
  padding-top: 10px;
}
#mobile-search-container::before {
  content: '';
  position: absolute;
  top: 2px;
  right: 60px; /* roughly under the search icon */
  border-width: 0 8px 8px 8px;
  border-style: solid;
  border-color: transparent transparent rgba(255,255,255,0.05) transparent;
  display: block;
}
"""

if "/* Modal constraints for desktop to prevent stretching */" not in css:
    css += "\n" + custom_css

with open(r'c:\Users\hp zbook\Desktop\LM\css\style.css', 'w', encoding='utf-8') as f:
    f.write(css)

# ============================================================
# 3. Ensure js/main.js populates real email
# ============================================================
with open(r'c:\Users\hp zbook\Desktop\LM\js\main.js', 'r', encoding='utf-8') as f:
    js = f.read()

# We already have syncUserAvatar replacing account-email-bot. We just make sure it's the real email.
# The code previously had:
# const email = isGuest ? 'guest@aiagent.pro' : (u.uid || '');
# Let's ensure it's using u.email if available.
js = js.replace("const email = isGuest ? 'guest@aiagent.pro' : (u.uid || '');", 
                "const email = isGuest ? 'guest@aiagent.pro' : (u.email || u.uid || 'user@example.com');")

with open(r'c:\Users\hp zbook\Desktop\LM\js\main.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("[OK] UI adjustments applied successfully.")
