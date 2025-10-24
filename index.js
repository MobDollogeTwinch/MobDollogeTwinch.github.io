  (async function () {
    const resp = await fetch('index.json')
    const blog_list = await resp.json()

    const confirm_arrow = document.querySelector('.filter_cond i')
    const input = document.querySelector('.filter_cond input')
    const main = document.querySelector('main')
    const toc = document.querySelector('nav .toc')

    function handle_main(kw, frag) {
      // <h2 id="筛选条件kw">筛选条件：<code>kw</code></h2>
      {
        const h2 = document.createElement('h2')
        h2.id = `筛选条件${kw}`;
        h2.textContent = '筛选条件：'
        const code = document.createElement('code')
        code.textContent = kw
        h2.appendChild(code)
        frag.appendChild(h2)
      }

      blog_list
        .filter(blog_info => blog_info.title.includes(kw))
        .forEach(opted => {
          // <h3 id=opted.title><a href=opted.link>opted.title</a></h3>
          {
            const h3 = document.createElement('h3')
            h3.id = opted.title
            const a = document.createElement('a')
            a.href = opted.link
            a.textContent = opted.title
            h3.appendChild(a)
            frag.appendChild(h3)
          }

          // <ul>
          //   <li>作者：opted.author</li>
          //   <li>日期：opted.date</li>
          //   <li>文章状态：opted.status</li>
          // </ul>
          {
            const ul = document.createElement('ul');
            [
              ["作者", opted.author],
              ["日期", opted.date],
              ["文章状态", opted.status]
            ].forEach(info => {
              const li = document.createElement('li')
              li.textContent = `${info[0]}：${info[1]}`
              ul.appendChild(li)
            })
            frag.appendChild(ul)
          }
        })
    }

    // AIGC
    function handle_toc(kw, frag) {
      // 清理字符串，生成适合作为 id 的字符串（保留中文、字母、数字、-_.）
      function sanitizeForId(str) {
        return String(str || '')
          .trim()
          .normalize('NFKC')
          .replace(/\s+/g, '')
          .replace(/[^0-9\p{L}\-_.]/gu, '') // 支持 unicode
      }

      // Helper: 在 frag 中查找或创建顶层的 <ul>
      function getOrCreateTopUl(container) {
        // 如果传入的是一个 <ul> 元素，直接返回
        if (container instanceof HTMLUListElement) return container;

        // 尝试在容器中查找已存在的 ul（DocumentFragment 支持 querySelector）
        let existing = null;
        if (typeof container.querySelector === 'function') {
          existing = container.querySelector('ul');
        } else {
          for (const child of container.childNodes) {
            if (child.nodeType === 1 && child.tagName.toLowerCase() === 'ul') {
              existing = child;
              break;
            }
          }
        }

        if (existing) return existing;

        // 否则创建一个新的 ul 并 append 到容器（container 可能是 fragment 或 element）
        const newUl = document.createElement('ul');
        container.appendChild(newUl);
        return newUl;
      }

      // 不直接操作全局 toc 的 innerHTML（避免多次清空真实 DOM）
      // 我们把构建的 <li> 放到传入的 frag（或其内部的 ul）中
      const topUl = getOrCreateTopUl(frag);

      // 外层 li -> a（筛选条件）
      const outerLi = document.createElement('li');
      const outerA = document.createElement('a');
      outerA.href = `#筛选条件${kw}`;
      outerA.id = `toc-筛选条件${sanitizeForId(kw)}`;
      outerA.innerHTML = `筛选条件：<code>${kw}</code>`;
      outerLi.appendChild(outerA);

      // 内层文章列表（作为 outerLi 的子 ul）
      const innerUl = document.createElement('ul');

      // 找到与关键词匹配的文章（与 handle_main 使用相同的过滤条件）
      blog_list
        .filter(article => article.title.includes(kw))
        .forEach(article => {
          // 生成一个安全的 articleId
          const articleId = sanitizeForId(article.title || `article${Date.now()}`);

          // 尝试在 main 中找到对应的 h3（以文本匹配）
          const h3Candidates = Array.from(main.querySelectorAll('h3'));
          const matchedH3 = h3Candidates.find(h => {
            const a = h.querySelector('a');
            const text = a ? a.textContent.trim() : h.textContent.trim();
            return text === article.title;
          });

          if (matchedH3) {
            // 将 h3 的 id 设置为我们生成的安全 id（保证锚点一致）
            matchedH3.id = articleId;
          } else {
            // 如果还没渲染到 main 中，也不用强制创建 h3；toc 的 href 仍然指向 #articleId
          }

          const li = document.createElement('li');
          const a = document.createElement('a');
          a.href = `#${articleId}`;
          a.id = `toc-${articleId}`;
          a.textContent = article.title;
          li.appendChild(a);
          innerUl.appendChild(li);
        });

      if (innerUl.children.length) {
        outerLi.appendChild(innerUl);
      }

      // 把外层 li 加到 topUl 中（topUl 是 frag 内的那个 <ul>）
      topUl.appendChild(outerLi);
    }

    function handle_all() {
      main.innerHTML = ''
      toc.innerHTML = ''
      const main_frag = document.createDocumentFragment()
      const toc_frag = document.createDocumentFragment()

      const raw = input.value || '';
      const q = raw.trim();
      if (q === '') {
        handle_main('', main_frag);
        handle_toc('', toc_frag);
      } else {
        q.split(/\s+/)
          .filter(item => item !== '')
          .forEach(kw => {
            handle_main(kw, main_frag);
            handle_toc(kw, toc_frag);
          });
      }

      main.appendChild(main_frag)
      toc.appendChild(toc_frag)
    }

    confirm_arrow.addEventListener('click', handle_all)

    input.addEventListener('keydown', (e) => {
      if(e.key === 'Enter') handle_all()
    })
    confirm_arrow.click()
  })()