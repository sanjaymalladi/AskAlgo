# code_analyzer.py
import ast
import time

def analyze_code(code, expected_output=None):
    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        return f"Syntax Error: {str(e)}"

    analysis = {
        "time_complexity": estimate_time_complexity(tree),
        "space_complexity": estimate_space_complexity(tree),
        "code_quality": check_code_quality(tree),
    }

    if expected_output:
        analysis["correctness"] = check_correctness(code, expected_output)

    return analysis

def estimate_time_complexity(tree):
    # This is a simplified estimation. In reality, you'd need a more sophisticated analysis.
    loop_count = sum(1 for node in ast.walk(tree) if isinstance(node, (ast.For, ast.While)))
    if loop_count == 0:
        return "O(1)"
    elif loop_count == 1:
        return "O(n)"
    else:
        return f"O(n^{loop_count})"

def estimate_space_complexity(tree):
    # Simplified estimation
    var_count = sum(1 for node in ast.walk(tree) if isinstance(node, ast.Name) and isinstance(node.ctx, ast.Store))
    return f"O({var_count})"

def check_code_quality(tree):
    issues = []
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef) and len(node.body) > 20:
            issues.append("Function is too long. Consider breaking it down.")
        # Add more code quality checks here
    return issues

def check_correctness(code, expected_output):
    try:
        start_time = time.time()
        exec_globals = {}
        exec(code, exec_globals)
        result = exec_globals.get('result', None)  # Assume the code stores its output in a variable called 'result'
        execution_time = time.time() - start_time

        if result == expected_output:
            return f"Correct! Execution time: {execution_time:.4f} seconds"
        else:
            return f"Incorrect. Expected {expected_output}, but got {result}"
    except Exception as e:
        return f"Error during execution: {str(e)}"

# Usage example
if __name__ == "__main__":
    code = """
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr

result = bubble_sort([64, 34, 25, 12, 22, 11, 90])
"""
    print(analyze_code(code, expected_output=[11, 12, 22, 25, 34, 64, 90]))