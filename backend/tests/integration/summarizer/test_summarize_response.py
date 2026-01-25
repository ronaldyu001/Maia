from backend.routes.chat.helpers.summarize_response import summarize_response


def test_summarize_response_integration():
    text = """
    "Sure, let’s continue with the AI-assisted refactorings:\n\n### Using Static Code Analyzers and Translators\n\n1. **Code Analyzers**: Tools such as ESLint for JavaScript or Stylelint for CSS can help identify common issues in your codebase. These tools are often integrated into modern IDEs like VSCode and offer a lot of customization to fit specific needs.\n\n2. **Code Translators**: CodeQL (GitHub's query language) is a powerful tool that allows you to write SQL-like queries to analyze your codebase for patterns, issues, or security vulnerabilities. GitHub Copilot or custom AI models can also suggest improvements and refactorings based on existing knowledge.\n\n### Implementing Automated Testing\n\n4. **Automated Testing**: Tools like Jest for JavaScript, pytest for Python, or JUnit for Java can help ensure that changes don’t break existing functionality. By writing tests early and often, you can catch bugs before they cause issues in production.\n\n5. **Code Translators (AI Models)**: Consider using AI models trained on large codebases to suggest refactorings based on patterns observed in the code. This could involve training a model with your codebase or using existing models like GitHub Copilot for JavaScript/TypeScript, which can provide suggestions that align well with your project’s needs.\n\n### Specific Steps\n\n1. **Identify Patterns**: Go through parts of your codebase where patterns are common. Identify these areas and start documenting them more thoroughly to ensure consistency across the system.\n2. **Use AI Tools**: Implement training models for your specific language or use GitHub Copilot for JavaScript/TypeScript, which can suggest improvements based on existing knowledge.\n\n3. **Regular Reviews**: Have regular code reviews with team members to discuss the state of documentation and identify areas where improvements can be made. This ensures that changes align well with your documentation updates.\n\n4. **Feedback Loops**: Implement a feedback loop between refactorings and documentation updates. As you refactor, ensure that new versions are aligned with existing documentation.\n\nWould you like to explore any specific tools or practices further? Or do you have another area where you need more guidance on AI assistance?",
    """

    summary = summarize_response(text)
    print(summary)

    assert summary.startswith("[Compressed] ")



test_summarize_response_integration()