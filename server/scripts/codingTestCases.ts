import { CodingTestCase } from '../src/types/coding';

export const codingTestCases: Record<string, CodingTestCase[]> = {
  'two-sum': [
    { id: '1', input: '[2, 7, 11, 15]\n9', expectedOutput: '[0, 1]', isHidden: false },
    { id: '2', input: '[3, 2, 4]\n6', expectedOutput: '[1, 2]', isHidden: false },
    { id: '3', input: '[3, 3]\n6', expectedOutput: '[0, 1]', isHidden: true },
    { id: '4', input: '[1, 5, 8, 20]\n25', expectedOutput: '[1, 3]', isHidden: true },
    { id: '5', input: '[-1, -2, -3, -4, -5]\n-8', expectedOutput: '[2, 4]', isHidden: true }
  ],
  'valid-parentheses': [
    { id: '1', input: '"()"', expectedOutput: 'true', isHidden: false },
    { id: '2', input: '"()[]{}"', expectedOutput: 'true', isHidden: false },
    { id: '3', input: '"(]"', expectedOutput: 'false', isHidden: true },
    { id: '4', input: '"([)]"', expectedOutput: 'false', isHidden: true },
    { id: '5', input: '"{[]}"', expectedOutput: 'true', isHidden: true }
  ],
  'binary-search': [
    { id: '1', input: '[-1,0,3,5,9,12]\n9', expectedOutput: '4', isHidden: false },
    { id: '2', input: '[-1,0,3,5,9,12]\n2', expectedOutput: '-1', isHidden: false },
    { id: '3', input: '[5]\n5', expectedOutput: '0', isHidden: true },
    { id: '4', input: '[2, 5]\n5', expectedOutput: '1', isHidden: true },
    { id: '5', input: '[2, 5]\n2', expectedOutput: '0', isHidden: true }
  ],
  'reverse-linked-list': [
    { id: '1', input: '[1,2,3,4,5]', expectedOutput: '[5,4,3,2,1]', isHidden: false },
    { id: '2', input: '[1,2]', expectedOutput: '[2,1]', isHidden: false },
    { id: '3', input: '[]', expectedOutput: '[]', isHidden: true },
    { id: '4', input: '[1]', expectedOutput: '[1]', isHidden: true },
    { id: '5', input: '[1,1,1]', expectedOutput: '[1,1,1]', isHidden: true }
  ],
  'valid-anagram': [
    { id: '1', input: '"anagram"\n"nagaram"', expectedOutput: 'true', isHidden: false },
    { id: '2', input: '"rat"\n"car"', expectedOutput: 'false', isHidden: false },
    { id: '3', input: '"a"\n"a"', expectedOutput: 'true', isHidden: true },
    { id: '4', input: '"ab"\n"a"', expectedOutput: 'false', isHidden: true },
    { id: '5', input: '"a"\n"b"', expectedOutput: 'false', isHidden: true }
  ],
  'valid-palindrome': [
    { id: '1', input: '"A man, a plan, a canal: Panama"', expectedOutput: 'true', isHidden: false },
    { id: '2', input: '"race a car"', expectedOutput: 'false', isHidden: false },
    { id: '3', input: '" "', expectedOutput: 'true', isHidden: true },
    { id: '4', input: '"0P"', expectedOutput: 'false', isHidden: true },
    { id: '5', input: '"ab_a"', expectedOutput: 'true', isHidden: true }
  ],
  'best-time-to-buy-and-sell-stock': [
    { id: '1', input: '[7,1,5,3,6,4]', expectedOutput: '5', isHidden: false },
    { id: '2', input: '[7,6,4,3,1]', expectedOutput: '0', isHidden: false },
    { id: '3', input: '[1]', expectedOutput: '0', isHidden: true },
    { id: '4', input: '[2,4,1]', expectedOutput: '2', isHidden: true },
    { id: '5', input: '[2,1,2,1,0,1,2]', expectedOutput: '2', isHidden: true }
  ],
  'invert-binary-tree': [
    { id: '1', input: '[4,2,7,1,3,6,9]', expectedOutput: '[4,7,2,9,6,3,1]', isHidden: false },
    { id: '2', input: '[2,1,3]', expectedOutput: '[2,3,1]', isHidden: false },
    { id: '3', input: '[]', expectedOutput: '[]', isHidden: true },
    { id: '4', input: '[1]', expectedOutput: '[1]', isHidden: true },
    { id: '5', input: '[1,2]', expectedOutput: '[1,null,2]', isHidden: true }
  ],
  'maximum-depth-of-binary-tree': [
    { id: '1', input: '[3,9,20,null,null,15,7]', expectedOutput: '3', isHidden: false },
    { id: '2', input: '[1,null,2]', expectedOutput: '2', isHidden: false },
    { id: '3', input: '[]', expectedOutput: '0', isHidden: true },
    { id: '4', input: '[0]', expectedOutput: '1', isHidden: true },
    { id: '5', input: '[1,2,3,4,null,null,5]', expectedOutput: '3', isHidden: true }
  ],
  'contains-duplicate': [
    { id: '1', input: '[1,2,3,1]', expectedOutput: 'true', isHidden: false },
    { id: '2', input: '[1,2,3,4]', expectedOutput: 'false', isHidden: false },
    { id: '3', input: '[1,1,1,3,3,4,3,2,4,2]', expectedOutput: 'true', isHidden: true },
    { id: '4', input: '[]', expectedOutput: 'false', isHidden: true },
    { id: '5', input: '[0]', expectedOutput: 'false', isHidden: true }
  ],
  'merge-two-sorted-lists': [
    { id: '1', input: '[1,2,4]\n[1,3,4]', expectedOutput: '[1,1,2,3,4,4]', isHidden: false },
    { id: '2', input: '[]\n[]', expectedOutput: '[]', isHidden: false },
    { id: '3', input: '[]\n[0]', expectedOutput: '[0]', isHidden: true },
    { id: '4', input: '[2]\n[1]', expectedOutput: '[1,2]', isHidden: true },
    { id: '5', input: '[-9,3]\n[5,7]', expectedOutput: '[-9,3,5,7]', isHidden: true }
  ],
  'climbing-stairs': [
    { id: '1', input: '2', expectedOutput: '2', isHidden: false },
    { id: '2', input: '3', expectedOutput: '3', isHidden: false },
    { id: '3', input: '4', expectedOutput: '5', isHidden: true },
    { id: '4', input: '1', expectedOutput: '1', isHidden: true },
    { id: '5', input: '5', expectedOutput: '8', isHidden: true }
  ],
  'missing-number': [
    { id: '1', input: '[3,0,1]', expectedOutput: '2', isHidden: false },
    { id: '2', input: '[0,1]', expectedOutput: '2', isHidden: false },
    { id: '3', input: '[9,6,4,2,3,5,7,0,1]', expectedOutput: '8', isHidden: true },
    { id: '4', input: '[0]', expectedOutput: '1', isHidden: true },
    { id: '5', input: '[1]', expectedOutput: '0', isHidden: true }
  ],
  'first-bad-version': [
    { id: '1', input: '5\n4', expectedOutput: '4', isHidden: false },
    { id: '2', input: '1\n1', expectedOutput: '1', isHidden: false },
    { id: '3', input: '3\n2', expectedOutput: '2', isHidden: true },
    { id: '4', input: '2\n2', expectedOutput: '2', isHidden: true },
    { id: '5', input: '10\n1', expectedOutput: '1', isHidden: true }
  ],
  'lowest-common-ancestor-of-a-binary-search-tree': [
    { id: '1', input: '[6,2,8,0,4,7,9,null,null,3,5]\n2\n8', expectedOutput: '6', isHidden: false },
    { id: '2', input: '[6,2,8,0,4,7,9,null,null,3,5]\n2\n4', expectedOutput: '2', isHidden: false },
    { id: '3', input: '[2,1]\n2\n1', expectedOutput: '2', isHidden: true },
    { id: '4', input: '[3,1,4,null,2]\n2\n4', expectedOutput: '3', isHidden: true },
    { id: '5', input: '[5,3,6,2,4,null,7]\n2\n4', expectedOutput: '3', isHidden: true }
  ],
  'lru-cache': [
    { id: '1', input: '["LRUCache","put","put","get","put","get","put","get","get","get"]\n[[2],[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]', expectedOutput: '[null,null,null,1,null,-1,null,-1,3,4]', isHidden: false },
    { id: '2', input: '["LRUCache","put","get"]\n[[1],[2,1],[2]]', expectedOutput: '[null,null,1]', isHidden: false },
    { id: '3', input: '["LRUCache","put","put","get"]\n[[1],[2,1],[3,2],[2]]', expectedOutput: '[null,null,null,-1]', isHidden: true },
    { id: '4', input: '["LRUCache","put","get","put","get","get"]\n[[2],[2,1],[2],[3,2],[2],[3]]', expectedOutput: '[null,null,1,null,1,2]', isHidden: true },
    { id: '5', input: '["LRUCache","get","put","get","put","put","get","get"]\n[[2],[2],[2,6],[1],[1,5],[1,2],[1],[2]]', expectedOutput: '[null,-1,null,-1,null,null,2,6]', isHidden: true }
  ],
  'number-of-islands': [
    { id: '1', input: '[["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', expectedOutput: '1', isHidden: false },
    { id: '2', input: '[["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', expectedOutput: '3', isHidden: false },
    { id: '3', input: '[["1"]]', expectedOutput: '1', isHidden: true },
    { id: '4', input: '[["0"]]', expectedOutput: '0', isHidden: true },
    { id: '5', input: '[["1","0","1"],["0","1","0"],["1","0","1"]]', expectedOutput: '5', isHidden: true }
  ],
  'longest-substring-without-repeating-characters': [
    { id: '1', input: '"abcabcbb"', expectedOutput: '3', isHidden: false },
    { id: '2', input: '"bbbbb"', expectedOutput: '1', isHidden: false },
    { id: '3', input: '"pwwkew"', expectedOutput: '3', isHidden: true },
    { id: '4', input: '""', expectedOutput: '0', isHidden: true },
    { id: '5', input: '"au"', expectedOutput: '2', isHidden: true }
  ],
  'three-sum': [
    { id: '1', input: '[-1,0,1,2,-1,-4]', expectedOutput: '[[-1,-1,2],[-1,0,1]]', isHidden: false },
    { id: '2', input: '[0,1,1]', expectedOutput: '[]', isHidden: false },
    { id: '3', input: '[0,0,0]', expectedOutput: '[[0,0,0]]', isHidden: true },
    { id: '4', input: '[-2,0,1,1,2]', expectedOutput: '[[-2,0,2],[-2,1,1]]', isHidden: true },
    { id: '5', input: '[0,0,0,0]', expectedOutput: '[[0,0,0]]', isHidden: true }
  ],
  'product-of-array-except-self': [
    { id: '1', input: '[1,2,3,4]', expectedOutput: '[24,12,8,6]', isHidden: false },
    { id: '2', input: '[-1,1,0,-3,3]', expectedOutput: '[0,0,9,0,0]', isHidden: false },
    { id: '3', input: '[0,0]', expectedOutput: '[0,0]', isHidden: true },
    { id: '4', input: '[1,1]', expectedOutput: '[1,1]', isHidden: true },
    { id: '5', input: '[2,3]', expectedOutput: '[3,2]', isHidden: true }
  ],
  'coin-change': [
    { id: '1', input: '[1,2,5]\n11', expectedOutput: '3', isHidden: false },
    { id: '2', input: '[2]\n3', expectedOutput: '-1', isHidden: false },
    { id: '3', input: '[1]\n0', expectedOutput: '0', isHidden: true },
    { id: '4', input: '[1]\n2', expectedOutput: '2', isHidden: true },
    { id: '5', input: '[186,419,83,408]\n6249', expectedOutput: '20', isHidden: true }
  ],
  'course-schedule': [
    { id: '1', input: '2\n[[1,0]]', expectedOutput: 'true', isHidden: false },
    { id: '2', input: '2\n[[1,0],[0,1]]', expectedOutput: 'false', isHidden: false },
    { id: '3', input: '1\n[]', expectedOutput: 'true', isHidden: true },
    { id: '4', input: '3\n[[1,0],[2,1]]', expectedOutput: 'true', isHidden: true },
    { id: '5', input: '3\n[[1,0],[2,1],[0,2]]', expectedOutput: 'false', isHidden: true }
  ],
  'kth-largest-element-in-an-array': [
    { id: '1', input: '[3,2,1,5,6,4]\n2', expectedOutput: '5', isHidden: false },
    { id: '2', input: '[3,2,3,1,2,4,5,5,6]\n4', expectedOutput: '4', isHidden: false },
    { id: '3', input: '[1]\n1', expectedOutput: '1', isHidden: true },
    { id: '4', input: '[2,1]\n1', expectedOutput: '2', isHidden: true },
    { id: '5', input: '[2,1]\n2', expectedOutput: '1', isHidden: true }
  ],
  'binary-tree-level-order-traversal': [
    { id: '1', input: '[3,9,20,null,null,15,7]', expectedOutput: '[[3],[9,20],[15,7]]', isHidden: false },
    { id: '2', input: '[1]', expectedOutput: '[[1]]', isHidden: false },
    { id: '3', input: '[]', expectedOutput: '[]', isHidden: true },
    { id: '4', input: '[1,2,null,3,null,4,null]', expectedOutput: '[[1],[2],[3],[4]]', isHidden: true },
    { id: '5', input: '[1,2,3,4,5]', expectedOutput: '[[1],[2,3],[4,5]]', isHidden: true }
  ],
  'word-search': [
    { id: '1', input: '[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]\n"ABCCED"', expectedOutput: 'true', isHidden: false },
    { id: '2', input: '[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]\n"SEE"', expectedOutput: 'true', isHidden: false },
    { id: '3', input: '[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]\n"ABCB"', expectedOutput: 'false', isHidden: true },
    { id: '4', input: '[["a"]]\n"a"', expectedOutput: 'true', isHidden: true },
    { id: '5', input: '[["a","a"]]\n"aaa"', expectedOutput: 'false', isHidden: true }
  ],
  'merge-k-sorted-lists': [
    { id: '1', input: '[[1,4,5],[1,3,4],[2,6]]', expectedOutput: '[1,1,2,3,4,4,5,6]', isHidden: false },
    { id: '2', input: '[]', expectedOutput: '[]', isHidden: false },
    { id: '3', input: '[[]]', expectedOutput: '[]', isHidden: true },
    { id: '4', input: '[[1]]', expectedOutput: '[1]', isHidden: true },
    { id: '5', input: '[[1],[0]]', expectedOutput: '[0,1]', isHidden: true }
  ],
  'trapping-rain-water': [
    { id: '1', input: '[0,1,0,2,1,0,1,3,2,1,2,1]', expectedOutput: '6', isHidden: false },
    { id: '2', input: '[4,2,0,3,2,5]', expectedOutput: '9', isHidden: false },
    { id: '3', input: '[]', expectedOutput: '0', isHidden: true },
    { id: '4', input: '[1]', expectedOutput: '0', isHidden: true },
    { id: '5', input: '[2,1,2]', expectedOutput: '1', isHidden: true }
  ],
  'word-ladder': [
    { id: '1', input: '"hit"\n"cog"\n["hot","dot","dog","lot","log","cog"]', expectedOutput: '5', isHidden: false },
    { id: '2', input: '"hit"\n"cog"\n["hot","dot","dog","lot","log"]', expectedOutput: '0', isHidden: false },
    { id: '3', input: '"a"\n"c"\n["a","b","c"]', expectedOutput: '2', isHidden: true },
    { id: '4', input: '"hot"\n"dog"\n["hot","dog"]', expectedOutput: '0', isHidden: true },
    { id: '5', input: '"hit"\n"cog"\n["hot","cog","dot","dog","hit","lot","log"]', expectedOutput: '5', isHidden: true }
  ],
  'minimum-window-substring': [
    { id: '1', input: '"ADOBECODEBANC"\n"ABC"', expectedOutput: '"BANC"', isHidden: false },
    { id: '2', input: '"a"\n"a"', expectedOutput: '"a"', isHidden: false },
    { id: '3', input: '"a"\n"aa"', expectedOutput: '""', isHidden: true },
    { id: '4', input: '"ab"\n"b"', expectedOutput: '"b"', isHidden: true },
    { id: '5', input: '"ab"\n"a"', expectedOutput: '"a"', isHidden: true }
  ],
  'median-of-two-sorted-arrays': [
    { id: '1', input: '[1,3]\n[2]', expectedOutput: '2.00000', isHidden: false },
    { id: '2', input: '[1,2]\n[3,4]', expectedOutput: '2.50000', isHidden: false },
    { id: '3', input: '[0,0]\n[0,0]', expectedOutput: '0.00000', isHidden: true },
    { id: '4', input: '[]\n[1]', expectedOutput: '1.00000', isHidden: true },
    { id: '5', input: '[2]\n[]', expectedOutput: '2.00000', isHidden: true }
  ]
};
