---
title: "C++Primer习题"
author: "mob_dolloge"
date: "2025-10-23"
status: "编辑中"
---

## 11.2.1节习题

### 练习11.5
> 解释map和set的区别。你如何选择使用哪个？

map和set都是关联容器，而且里面元素的关键字不能重复；但是map的元素不仅包括关键字还包括值，而set的元素只包括关键字，换句话说set的关键字就是set的值。

如果存储几组家庭人员信息，那么需要区分每条信息中哪些是电话号码哪些是姓名，就需要关键字来规定这些值的类别，可以使用map；而对于那些每一条数据都是一个类别的数据集，使用set存储更方便。

### 练习11.6
> 解释set和list的区别。你如何选择使用哪个？

list是顺序容器而set是关联容器，一些能用在顺序容器的操作无法用在set上。另外list一般支持重复元素，而set不支持。

所以，想要去重且不考虑顺序只是归类时，使用set会比较方便；如果想要实现一些更复杂的数据结构，用list会更好一点。

### 练习11.7
> 定义一个map，关键字是家庭的姓，值是一个vector，保存家中孩子（们）的名。编写代码，实现添加新的家庭以及向已有家庭中添加新的孩子。

```cpp
#include <map>
#include <string>
#include <vector>

using std::map;
using std::string;
using std::vector;

int main() {
    map<string, vector<string>> kid_name{};
    // 添加新的家庭
    kid_name.insert({"Zhang", {}});
    // 向已有家庭添加孩子名字
    kid_name["Zhang"].emplace_back("Zixuan");
}
```

### 练习11.8
> 编写一个程序，在一个vector而不是一个set中保存不重复的单词。使用set的优点是什么？

使用set的优点是可以直接使用标准库提供的去重功能。如果不用set而用vector的话应该如下表示：

```cpp
#include <vector>
#include <string>
#include <iostream>
#include <algorithm>// std::find

int main() {
    std::vector<std::string> words;
    std::string word;
    while(std::cin >> word) {
        auto it = std::find(words.begin(), words.end(), word);
        if(it == words.end())
            words.emplace_back(word);
    }
}
```

## 11.2.2节练习题

### 练习11.9
> 定义一个map，将单词与一个行号的list关联，list中保存的是单词出现的行号。

```cpp
std::map<std::string, std::list<std::size_t>> line_no;
```

### 练习11.10
> 可以定义一个vector<int>::iterator到int的map吗？list<int>::iterator到int的map呢？对于这两种情况，如果不能，解释为什么？

可以定义`vector<int>::iterator`到`int`，但是这不安全，因为vector添加元素后会导致内容迁移内存，原来的迭代器可能会失效，除非能保证vector不会再添加元素；而`list<int>::iterator`到`int`是完全可以的。

### 练习11.11
> 不使用decltype重新定义bookstore。其中：
> bool compareIsbn(const Sales_data &lhs, const Sales_data &rhs) { ... }
> multiset<Sales_data, decltype(compareIsbn) *> bookstore(compareIsbn);

```cpp
multiset<Sales_data, bool(*)(const Sales_data &, const Sales_data &)>
bookstore(compareIsbn);
// 不能传一个函数类型，传函数指针类型可以，因为函数类型无法被实例化，也无法构造对象
```

## 11.2.3节练习题

### 练习11.12
> 编写程序，读入string和int的序列，将每个string和int存入一个pair中，pair保存在一个vector中。

```cpp
#include <iostream>
#include <utility>
#include <vector>
#include <string>
int main() {
    std::vector<std::pair<std::string, int>> vec;
    std::string vec1;
    int vec2;
    while(std::cin >> vec1 >> vec2) {
        vec.emplace_back({vec1, vec2});
    }
}
```

### 练习11.13
> 在上一题的程序中，至少有三种创建pair的方法。编写此程序的三个版本，分别采用不同的方法创建pair。解释你认为哪种形式最易于编写和理解，为什么？

```cpp
// 第一种
vec.emplace_back({vec1, vec2});
// 第二种
vec.emplace_back(std::make_pair(vec1, vec2));
// 第三种
vec.emplace_back(std::pair<std::string, int>(vec1, vec2));
```
个人认为第二种更佳，因为既可以由代码本身知道是创建的pair，也比第三种写法更简便一些——特别是在复杂嵌套类型的情况下。当然如果代码清晰，那么使用第一种方式也可以，实际上也更佳简便。

### 练习11.14
> 扩展你在11.2.1节练习中编写的孩子姓到名的map，添加一个pair的vector，保存孩子的名和生日。

```cpp
#include <map>
#include <utility>
#include <string>
#include <vector>

int main() {
    using Name_and_Birthday = std::pair<std::string, std::string>;
    using Last_Name = std::string;
    using Kids = std::map<Last_Name, Name_and_Birthday>;
    Kids kids;
    // 添加新的家庭
    kids.insert({"Zhang", {}});
    // 向已有家庭添加孩子名字和生日
    kids["Zhang"].emplace_back({"zixuan", "2012-08-24"});
}
```

## 11.3.1节练习题

### 练习11.15
> 对一个int到vector<int>的map，其mapped_type、key_type和value_type分别是什么？

```cpp
#include <map>
#include <type_traits>
#include <utility>
#include <vector>

using mapped_type = std::map<int, std::vector<int>>::mapped_type;
using key_type = std::map<int, std::vector<int>>::key_type;
using value_type = std::map<int, std::vector<int>>::value_type;
using pair = std::pair<const int, std::vector<int>>;

static_assert(std::is_same_v<mapped_type, std::vector<int>> &&
              std::is_same_v<key_type, int> &&
              std::is_same_v<value_type, pair>, ""); // true
```
综上可知。

### 练习11.16
> 使用一个map迭代器编写一个表达式，将一个值赋予一个元素。

```cpp
#include <map>

int main() {
  std::map<int, int>::iterator it;
  std::map<int, int> m_map{{1, 2}, {2, 3}};// 例子
  it = m_map.begin();
  it->second = 4;
  it[5] = 6;
}
```

### 练习11.17
> 假定c是一个string的multiset，v是一个string的vector，解释下面的调用，指出每个调用是否合法：\
> copy(v.begin(), v.end(), inserter(c, c.end()));\
> copy(v.begin(), v.end(), back_inserter(c));\
> copy(c.begin(), c.end(), inserter(v, v.end()));\
> copy(c.begin(), c.end(), back_inserter(v));

除了第二个以外其它都合法，因为c是关联容器没有所谓前后，就不能使用back_inserter。

### 练习11.18
> 写出第382页循环中map_it的类型，不要使用auto或者decltype。

```cpp
std::map<..., ...>::const_iterator
```