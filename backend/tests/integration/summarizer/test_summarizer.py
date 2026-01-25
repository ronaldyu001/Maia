import json
import re

from backend.Maia.hood.engine_wrappers.ollama.summarizer import Summarizer


TEXT = """
Assistant: Sure thing! When it comes to hosting your own server and managing security, there are several key areas you should focus on:

1. **Server Hardening**: Ensure that your server is configured securely by default. This includes disabling unnecessary services, hardening operating system settings (like turning off features like Samba or FTP), and removing any unnecessary software.

2. **Firewall Configuration**: Configure a firewall to restrict access to your server. Common protocols to be aware of are SSH for remote connections, HTTP/HTTPS for web traffic, SMTP for email communication, and DNS if you're using it. You might want to allow only specific IP addresses or ranges that need access.

3. **Vulnerability Management**: Keep all software up-to-date with the latest patches. This includes operating system updates, application software, and any dependencies. Regularly check security advisories and apply fixes promptly.

4. **Authentication and Authorization**: Use strong authentication mechanisms like SSH keys for secure login rather than passwords. Limit access to services by using appropriate user permissions (e.g., different users for different roles).

5. **Data Encryption**: Encrypt sensitive data both at rest and in transit. For example, use SSL/TLS to encrypt HTTP requests so that the traffic between your server and clients is encrypted.

6. **Log Monitoring**: Set up logging mechanisms for system events, application logs, and security events. Regularly review these logs to detect unusual activity or errors early on. Tools like Syslog, Auditd (on Linux), or third-party solutions can help with this.

7. **Regular Audits**: Conduct regular security audits of your server configurations and settings. This could involve checking for known vulnerabilities, ensuring that configurations match best practices, and making sure all necessary controls are in place.

8. **Multi-Factor Authentication (MFA)**: Where possible, implement MFA to add an extra layer of security beyond just passwords. For example, using a biometric scan or sending a code to your phone can help prevent unauthorized access.

9. **Secure Software Deployment**: When deploying new software or updates, verify their integrity and authenticity. Avoid downloading from untrusted sources and always look for official releases.

10. **Network Segmentation**: If possible, segment your network into different zones (e.g., DMZ - demilitarized zone). This can help isolate services that require higher security measures compared to others.

By addressing these areas, you'll be able to establish a more secure environment for your server and reduce the risks associated with hosting on-premises. Do you have any specific questions about how to implement some of these recommendations?
User: do you know how to code in python?
Assistant: I can certainly help guide you through Python coding if that's what you're looking for! What specifically would you like to learn or work on today? Perhaps we could start by going over basic syntax and then move onto more advanced topics as needed. Do you have a particular project or concept in mind that you'd like to tackle with Python?
User: I know Python decently well, I’m just trying to get to know your knowledge base. Can you write a simple find nth fibonacci number function?
Assistant: Sure thing! Let's create a function that calculates the \( n \)-th Fibonacci number. The Fibonacci sequence is defined as follows:

- \( F(0) = 0 \)
- \( F(1) = 1 \)
- For \( n > 1 \), \( F(n) = F(n-1) + F(n-2) \)

Here’s a simple Python function to compute the \( n \)-th Fibonacci number:

```python
def find_nth_fibonacci(n):
    if n == 0:
        return 0
    elif n == 1:
        return 1
    
    # Initialize first two fibonacci numbers
    prev, curr = 0, 1
    
    for _ in

"""


def test_summarizer_integration():
    summarizer = Summarizer()
    session_id = "integration-test-session"
    window_size_tkns = 512

    response = summarizer.summarize(
        session_id=session_id,
        window_size_tkns=window_size_tkns,
        given_text=TEXT,
    )
    print(response)


test_summarizer_integration()
