import re
import os

cwd = "c:/Users/Administrator/Downloads/PFA html - Copie - Copie"

def extract_style(filename):
    filepath = os.path.join(cwd, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    style_match = re.search(r'<style>(.*?)</style>', content, re.DOTALL)
    if style_match:
        css = style_match.group(1)
        # Remove style block entirely
        new_content = re.sub(r'\s*<style>.*?</style>\s*', '\n', content, flags=re.DOTALL)
        
        # Add link to style.css if not present
        if 'href="style.css"' not in new_content:
            head_end = new_content.find('</head>')
            if head_end != -1:
                link_tag = '    <link rel="stylesheet" href="style.css">\n'
                new_content = new_content[:head_end] + link_tag + new_content[head_end:]
        
        # If login or signup, add class to body
        if filename == 'login.html':
            new_content = new_content.replace('<body>', '<body class="auth-body login-body">')
        elif filename == 'signup.html':
            new_content = new_content.replace('<body>', '<body class="auth-body signup-body">')
            
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
            
        return css
    return ""

def main():
    files = ['services.html', 'itineraries.html', 'activities.html', 'login.html', 'signup.html']
    all_css = []
    
    for f in files:
        css = extract_style(f)
        if css:
            # For login and signup, we need to scope the styles so they don't clash with global ones or each other
            if f == 'login.html':
                # Prefix body with .login-body
                css = css.replace('body {', 'body.login-body {')
                css = css.replace('.login-container {', '.login-body .login-container {')
                css = css.replace('.login-image {', '.login-body .login-image {')
                css = css.replace('.login-form-container {', '.login-body .login-form-container {')
            elif f == 'signup.html':
                css = css.replace('body {', 'body.signup-body {')
                css = css.replace('.login-container {', '.signup-body .login-container {')
                css = css.replace('.login-image {', '.signup-body .login-image {')
                css = css.replace('.login-form-container {', '.signup-body .login-form-container {')
            
            all_css.append(f"\n/* Styles extracted from {f} */\n{css}")
            
    if all_css:
        style_path = os.path.join(cwd, 'style.css')
        with open(style_path, 'a', encoding='utf-8') as f:
            f.write("".join(all_css))

if __name__ == '__main__':
    main()
