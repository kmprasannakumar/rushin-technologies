(function () {
  "use strict";

  var BLOG_DATA_PATH = window.BLOG_DATA_PATH || "data/blogs.json";
  var BLOG_POST_BASE = window.BLOG_POST_BASE || "blog/post.html";
  var ASSET_BASE = window.BLOG_ASSET_BASE || "";

  function normalizeImagePath(path) {
    if (!path) return ASSET_BASE + "assets/images/logo.png";
    if (/^https?:\/\//i.test(path) || path.startsWith("/")) return path;
    return ASSET_BASE + path;
  }

  function toDateValue(value) {
    var d = new Date(value);
    var t = d.getTime();
    return Number.isNaN(t) ? 0 : t;
  }

  function formatDate(value) {
    var d = new Date(value);
    if (Number.isNaN(d.getTime())) return value || "";
    return d.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }

  function stripHtml(html) {
    if (!html) return "";
    var tmp = document.createElement("div");
    tmp.innerHTML = html;
    return (tmp.textContent || tmp.innerText || "").replace(/\s+/g, " ").trim();
  }

  function excerpt(text, minLen, maxLen) {
    if (!text) return "";
    if (text.length <= maxLen) return text;
    var sliced = text.slice(0, maxLen);
    if (sliced.length < minLen) return sliced + "...";
    var lastSpace = sliced.lastIndexOf(" ");
    if (lastSpace > minLen) {
      return sliced.slice(0, lastSpace) + "...";
    }
    return sliced + "...";
  }

  function normalizePosts(rawPosts) {
    var posts = Array.isArray(rawPosts) ? rawPosts.slice() : [];
    posts = posts.map(function (post, index) {
      var id = post.id || post.slug || String(index + 1);
      var plain = stripHtml(post.content);
      return {
        id: id,
        title: post.title || "Untitled Blog",
        slug: post.slug || id,
        date: post.date || "",
        formattedDate: formatDate(post.date || ""),
        metaDescription: post.meta_description || "",
        image: normalizeImagePath(post.image),
        imageAlt: post.image_alt || ((post.title || "Blog") + " cover image"),
        content: post.content || "",
        plainContent: plain,
        shortDescription: excerpt(post.meta_description || plain, 100, 150)
      };
    });

    posts.sort(function (a, b) {
      return toDateValue(b.date) - toDateValue(a.date);
    });

    return posts;
  }

  function uniquePaths(paths) {
    var map = Object.create(null);
    var out = [];
    paths.forEach(function (p) {
      if (!p) return;
      if (map[p]) return;
      map[p] = true;
      out.push(p);
    });
    return out;
  }

  function tryFetchJson(path) {
    return fetch(path).then(function (res) {
      if (!res.ok) {
        throw new Error("HTTP " + res.status + " for " + path);
      }
      return res.json();
    });
  }

  function fetchBlogs() {
    if (window.location.protocol === "file:" && Array.isArray(window.RUSHIN_BLOGS_DATA)) {
      return Promise.resolve(normalizePosts(window.RUSHIN_BLOGS_DATA));
    }

    var candidates = uniquePaths([
      BLOG_DATA_PATH,
      "data/blogs.json",
      "../data/blogs.json",
      "/data/blogs.json"
    ]);

    var index = 0;

    function next() {
      if (index >= candidates.length) {
        throw new Error("Unable to load blog data from known paths");
      }

      var path = candidates[index++];
      return tryFetchJson(path).catch(function () {
        return next();
      });
    }

    return Promise.resolve().then(next).then(normalizePosts);
  }

  function blogCardHtml(post, postLinkPrefix) {
    var href = postLinkPrefix + "?id=" + encodeURIComponent(post.id);
    return "" +
      "<article class=\"blog-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm\">" +
      "<p class=\"text-xs font-semibold uppercase tracking-wide text-blue-700\">" + post.formattedDate + "</p>" +
      "<h3 class=\"mt-2 text-xl font-bold text-slate-900\">" + post.title + "</h3>" +
      "<p class=\"mt-3 text-sm leading-7 text-slate-600\">" + post.shortDescription + "</p>" +
      "<a href=\"" + href + "\" class=\"mt-4 inline-flex items-center text-sm font-semibold text-blue-700 hover:text-blue-800\">Read More</a>" +
      "</article>";
  }

  function renderHomepageLatest(posts) {
    var grid = document.getElementById("latestBlogsGrid");
    if (!grid) return;

    if (!posts.length) {
      grid.innerHTML = "<p class=\"text-slate-600\">No blogs available right now. Please check back soon.</p>";
      return;
    }

    var html = posts.slice(0, 3).map(function (post) {
      return blogCardHtml(post, "blog/post.html");
    }).join("");

    grid.innerHTML = html;
  }

  function renderBlogListing(posts) {
    var grid = document.getElementById("allBlogsGrid");
    if (!grid) return;

    if (!posts.length) {
      grid.innerHTML = "<p class=\"text-slate-600\">No blogs available right now. Please check back soon.</p>";
      return;
    }

    var html = posts.map(function (post) {
      return blogCardHtml(post, "post.html");
    }).join("");

    grid.innerHTML = html;
  }

  function renderSinglePost(posts) {
    var container = document.getElementById("blogPostContainer");
    if (!container) return;

    var params = new URLSearchParams(window.location.search);
    var id = params.get("id");
    var post = posts.find(function (item) {
      return item.id === id || item.slug === id;
    });

    if (!post && posts.length) {
      post = posts[0];
    }

    if (!post) {
      container.innerHTML = "<p class=\"text-slate-600\">Blog post not found.</p>";
      return;
    }

    document.title = post.title + " | RushIn Technologies Blog";
    var metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", post.metaDescription || post.shortDescription);
    }

    container.innerHTML = "" +
      "<article class=\"rounded-2xl border border-slate-200 bg-white p-6 md:p-9 shadow-sm\">" +
      "<p class=\"text-sm font-semibold uppercase tracking-wide text-blue-700\">" + post.formattedDate + "</p>" +
      "<h1 class=\"mt-2 text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight\">" + post.title + "</h1>" +
      "<img class=\"blog-cover mt-6\" src=\"" + post.image + "\" alt=\"" + post.imageAlt + "\" loading=\"lazy\">" +
      "<div class=\"blog-content mt-7 text-base\">" + post.content + "</div>" +
      "</article>";
  }

  fetchBlogs()
    .then(function (posts) {
      renderHomepageLatest(posts);
      renderBlogListing(posts);
      renderSinglePost(posts);
    })
    .catch(function (error) {
      var fallbackIds = ["latestBlogsGrid", "allBlogsGrid", "blogPostContainer"];
      fallbackIds.forEach(function (id) {
        var el = document.getElementById(id);
        if (el) {
          var note = window.location.protocol === "file:" ? " Please run the site through a local server (for example: npm run serve)." : "";
          el.innerHTML = "<p class=\"text-slate-600\">Unable to load blogs right now. Please try again later." + note + "</p>";
        }
      });
      console.error("Blog load error:", error);
    });
})();
