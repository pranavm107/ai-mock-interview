export interface CodingLanguage {
  id: string;
  label: string;
  monacoLanguage: string;
  fileExtension: string;
  starterCode: string;
}

export const SUPPORTED_LANGUAGES: CodingLanguage[] = [
  {
    id: 'python',
    label: 'Python',
    monacoLanguage: 'python',
    fileExtension: 'py',
    starterCode: 'def solve():\n    # Write your code here\n    pass\n\nif __name__ == "__main__":\n    solve()'
  },
  {
    id: 'java',
    label: 'Java',
    monacoLanguage: 'java',
    fileExtension: 'java',
    starterCode: 'class Solution {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}'
  },
  {
    id: 'cpp',
    label: 'C++',
    monacoLanguage: 'cpp',
    fileExtension: 'cpp',
    starterCode: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}'
  },
  {
    id: 'c',
    label: 'C',
    monacoLanguage: 'c',
    fileExtension: 'c',
    starterCode: '#include <stdio.h>\n\nint main() {\n    // Write your code here\n    return 0;\n}'
  },
  {
    id: 'javascript',
    label: 'JavaScript',
    monacoLanguage: 'javascript',
    fileExtension: 'js',
    starterCode: 'function solve() {\n  // Write your code here\n}\n\nsolve();'
  },
  {
    id: 'typescript',
    label: 'TypeScript',
    monacoLanguage: 'typescript',
    fileExtension: 'ts',
    starterCode: 'function solve(): void {\n  // Write your code here\n}\n\nsolve();'
  },
  {
    id: 'go',
    label: 'Go',
    monacoLanguage: 'go',
    fileExtension: 'go',
    starterCode: 'package main\n\nimport "fmt"\n\nfunc main() {\n    // Write your code here\n}'
  },
  {
    id: 'rust',
    label: 'Rust',
    monacoLanguage: 'rust',
    fileExtension: 'rs',
    starterCode: 'fn main() {\n    // Write your code here\n}'
  },
  {
    id: 'csharp',
    label: 'C#',
    monacoLanguage: 'csharp',
    fileExtension: 'cs',
    starterCode: 'using System;\n\nclass Program {\n    static void Main() {\n        // Write your code here\n    }\n}'
  }
];

export const getDefaultLanguage = () => SUPPORTED_LANGUAGES[0];
