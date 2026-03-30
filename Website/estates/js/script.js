(function () {
  "use strict";

  function formatDate() {
    var yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  }

  function toSlug(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function getIdFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var idFromQuery = Number(params.get("id"));
    if (!isNaN(idFromQuery) && idFromQuery > 0) return idFromQuery;

    var slugValue = params.get("slug");
    if (slugValue) {
      var slugParts = slugValue.split("-");
      var tail = Number(slugParts[slugParts.length - 1]);
      if (!isNaN(tail) && tail > 0) return tail;
    }

    var hash = (window.location.hash || "").replace(/^#/, "");
    if (hash) {
      var hashParts = hash.split("-");
      var hashTail = Number(hashParts[hashParts.length - 1]);
      if (!isNaN(hashTail) && hashTail > 0) return hashTail;
    }

    return NaN;
  }

  function toClassToken(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderTags(highlights) {
    if (!Array.isArray(highlights) || highlights.length === 0) return "";
    return "<div class=\"tag-list\">" + highlights.map(function (tag) {
      var token = toClassToken(tag);
      return "<span class=\"tag-pill tag-" + token + "\">" + escapeHtml(tag) + "</span>";
    }).join("") + "</div>";
  }

  function renderCardSpecs(property) {
    var bhk = escapeHtml(property.bhk || "N/A");
    var area = escapeHtml(property.areaSqft || "N/A");
    var status = escapeHtml(property.status || "Ready to Move");
    return "<p class=\"card-specs\"><span>" + bhk + "</span><span>" + area + " sqft</span><span>" + status + "</span></p>";
  }

  function renderCard(property, detailsPath) {
    var category = property.category || property.type || "Property";
    var categoryClass = "category-" + toClassToken(category);

    var propertySlug = toSlug(property.title) + "-" + property.id;

    return "" +
      "<article class=\"card\">" +
      "<img class=\"card-media\" src=\"" + property.image + "\" alt=\"" + property.title + " in " + property.location + "\" loading=\"lazy\">" +
      "<div class=\"card-body\">" +
      "<div class=\"badge-row\">" +
      "<span class=\"category-badge " + categoryClass + "\">" + escapeHtml(category) + "</span>" +
      "</div>" +
      "<h3 class=\"card-title\">" + property.title + "</h3>" +
      renderCardSpecs(property) +
      "<p class=\"meta\">" + property.location + "</p>" +
      "<p class=\"price\">" + property.price + "</p>" +
      renderTags(property.highlights) +
      "<div class=\"card-actions\">" +
        "<a class=\"btn btn-primary\" href=\"" + detailsPath + "?slug=" + propertySlug + "\">View Details</a>" +
      "</div>" +
      "</div>" +
      "</article>";
  }

  function loadProperties() {
    return fetch("data/properties.json").then(function (res) {
      if (!res.ok) throw new Error("Unable to load property data");
      return res.json();
    });
  }

  function renderFeatured(properties) {
    var root = document.getElementById("featuredProperties");
    if (!root) return;

    var html = properties.slice(0, 3).map(function (property) {
      return renderCard(property, "property-details.html");
    }).join("");

    root.innerHTML = html || "<p class=\"notice\">No featured properties available right now.</p>";
  }

  function renderInvestment(properties) {
    var root = document.getElementById("investmentOpportunities");
    if (!root) return;

    var investment = properties.filter(function (property) {
      return property.category === "Investment Opportunity";
    }).slice(0, 4);

    var html = investment.map(function (property) {
      return renderCard(property, "property-details.html");
    }).join("");

    root.innerHTML = html || "<p class=\"notice\">No investment opportunities available right now.</p>";
  }

  function uniqueValues(properties, key) {
    var values = [];
    var map = Object.create(null);
    properties.forEach(function (property) {
      var value = property[key];
      if (!value || map[value]) return;
      map[value] = true;
      values.push(value);
    });
    return values;
  }

  function parsePriceToNumber(priceText) {
    var text = String(priceText || "").toLowerCase().replace(/,/g, "").trim();
    var match = text.match(/([0-9]+(?:\.[0-9]+)?)/);
    if (!match) return Number.MAX_SAFE_INTEGER;

    var value = Number(match[1]);
    if (isNaN(value)) return Number.MAX_SAFE_INTEGER;

    if (text.indexOf("cr") !== -1 || text.indexOf("crore") !== -1) {
      return value * 10000000;
    }

    if (text.indexOf("l") !== -1 || text.indexOf("lakh") !== -1) {
      return value * 100000;
    }

    return value;
  }

  function setupFilters(properties) {
    var listingTypeToggle = document.getElementById("listingTypeToggle");
    var searchEl = document.getElementById("searchFilter");
    var categoryEl = document.getElementById("categoryFilter");
    var locationEl = document.getElementById("locationFilter");
    var sortEl = document.getElementById("sortFilter");
    var clearEl = document.getElementById("clearFilters");
    var resultMeta = document.getElementById("resultMeta");
    var listRoot = document.getElementById("propertyListing");
    if (!listingTypeToggle || !searchEl || !categoryEl || !locationEl || !sortEl || !clearEl || !listRoot) return;

    var selectedListingType = "buy";
    var listingTypeButtons = Array.prototype.slice.call(listingTypeToggle.querySelectorAll(".listing-type-btn"));

    function setListingType(value) {
      selectedListingType = value === "rent" ? "rent" : "buy";
      listingTypeButtons.forEach(function (btn) {
        var isActive = btn.getAttribute("data-listing-type") === selectedListingType;
        btn.classList.toggle("is-active", isActive);
        btn.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
    }

    setListingType("buy");

    uniqueValues(properties, "category").forEach(function (category) {
      var option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categoryEl.appendChild(option);
    });

    uniqueValues(properties, "location").forEach(function (location) {
      var option = document.createElement("option");
      option.value = location;
      option.textContent = location;
      locationEl.appendChild(option);
    });

    function apply() {
      var searchText = searchEl.value.trim().toLowerCase();
      var selectedCategory = categoryEl.value;
      var selectedLocation = locationEl.value;
      var selectedSort = sortEl.value;

      var filtered = properties.filter(function (property) {
        var listingType = String(property.listingType || "buy").toLowerCase();
        var title = String(property.title || "").toLowerCase();
        var location = String(property.location || "").toLowerCase();
        var category = String(property.category || property.type || "").toLowerCase();
        var type = String(property.type || "").toLowerCase();

        var searchMatch = !searchText ||
          title.indexOf(searchText) !== -1 ||
          location.indexOf(searchText) !== -1 ||
          category.indexOf(searchText) !== -1 ||
          type.indexOf(searchText) !== -1;

        var categoryMatch = selectedCategory === "all" || property.category === selectedCategory;
        var locationMatch = selectedLocation === "all" || property.location === selectedLocation;
        var listingTypeMatch = listingType === selectedListingType;
        return listingTypeMatch && searchMatch && categoryMatch && locationMatch;
      });

      if (selectedSort === "priceAsc") {
        filtered.sort(function (a, b) {
          return parsePriceToNumber(a.price) - parsePriceToNumber(b.price);
        });
      } else if (selectedSort === "priceDesc") {
        filtered.sort(function (a, b) {
          return parsePriceToNumber(b.price) - parsePriceToNumber(a.price);
        });
      } else if (selectedSort === "titleAsc") {
        filtered.sort(function (a, b) {
          return String(a.title || "").localeCompare(String(b.title || ""));
        });
      }

      var html = filtered.map(function (property) {
        return renderCard(property, "property-details.html");
      }).join("");

      listRoot.innerHTML = html || "<p class=\"notice\">No properties match the selected filters.</p>";
      if (resultMeta) {
        var active = [];
        active.push("listing: " + selectedListingType);
        if (searchText) active.push("search: \"" + searchText + "\"");
        if (selectedCategory !== "all") active.push("category: " + selectedCategory);
        if (selectedLocation !== "all") active.push("location: " + selectedLocation);

        var suffix = active.length ? " | " + active.join(" | ") : "";
        resultMeta.textContent = filtered.length + " propert" + (filtered.length === 1 ? "y" : "ies") + " found" + suffix;
      }
    }

    listingTypeButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        setListingType(btn.getAttribute("data-listing-type"));
        apply();
      });
    });

    searchEl.addEventListener("input", apply);
    categoryEl.addEventListener("change", apply);
    locationEl.addEventListener("change", apply);
    sortEl.addEventListener("change", apply);
    clearEl.addEventListener("click", function () {
      setListingType("buy");
      searchEl.value = "";
      categoryEl.value = "all";
      locationEl.value = "all";
      sortEl.value = "default";
      apply();
    });
    apply();
  }

  function renderListing(properties) {
    var root = document.getElementById("propertyListing");
    if (!root) return;

    var html = properties.map(function (property) {
      return renderCard(property, "property-details.html");
    }).join("");

    root.innerHTML = html || "<p class=\"notice\">No properties found right now.</p>";
  }

  function renderDetails(properties) {
    var root = document.getElementById("propertyDetails");
    if (!root) return;

    var id = getIdFromUrl();
    var property = properties.find(function (item) {
      return item.id === id;
    }) || properties[0];

    if (!property) {
      root.innerHTML = "<p class=\"notice\">Property not found.</p>";
      return;
    }

    document.title = property.title + " | RushIn Estates";
    var meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", property.title + " in " + property.location + " by RushIn Estates. Explore pricing, category, investment potential, and site visit support.");
    }

    var whatsappMessage = encodeURIComponent("Hi RushIn Estates, I am interested in " + property.title + " in " + property.location + ". Please share more details.");
    var adviceMessage = encodeURIComponent("Hi RushIn Estates, please share investment advice for " + property.title + " in " + property.location + ".");

    var whyInvestList = Array.isArray(property.investmentBenefits) ? property.investmentBenefits : [];
    var whyInvestHtml = whyInvestList.length
      ? "<ul>" + whyInvestList.map(function (point) {
          return "<li>" + escapeHtml(point) + "</li>";
        }).join("") + "</ul>"
      : "<ul><li>Strong location demand and buyer confidence.</li><li>Good long-term capital appreciation potential.</li><li>High occupancy and rental visibility.</li></ul>";

    root.innerHTML = "" +
      "<h1 class=\"page-title\">" + property.title + "</h1>" +
      "<p class=\"page-subtitle\">Explore complete information for this property and connect with our team for site visit and booking support.</p>" +
      "<div class=\"details-wrap\">" +
      "<img class=\"details-image\" src=\"" + property.image + "\" alt=\"" + property.title + " property image\">" +
      "<div class=\"details-panel\">" +
      "<span class=\"badge\">" + escapeHtml(property.category || property.type || "Property") + "</span>" +
      "<h2>Property Details</h2>" +
      "<p><strong>Price:</strong> " + property.price + "</p>" +
      "<p><strong>Location:</strong> " + property.location + "</p>" +
      "<p><strong>Type:</strong> " + escapeHtml(property.type || "Property") + "</p>" +
      "<p>" + property.description + "</p>" +
      renderTags(property.highlights) +
      "<section class=\"why-invest\">" +
      "<h3>Why Invest?</h3>" +
      whyInvestHtml +
      "</section>" +
      "<div class=\"card-actions\">" +
      "<a class=\"btn btn-primary\" target=\"_blank\" rel=\"noopener noreferrer\" href=\"https://wa.me/919019660247?text=" + whatsappMessage + "\">Schedule Site Visit</a>" +
      "<a class=\"btn btn-outline\" target=\"_blank\" rel=\"noopener noreferrer\" href=\"https://wa.me/919019660247?text=" + adviceMessage + "\">Get Investment Advice</a>" +
      "<a class=\"btn btn-outline\" href=\"properties.html\">Back to Listings</a>" +
      "</div>" +
      "<section class=\"lead-box\">" +
      "<h3>Lead Assistance Form</h3>" +
      "<p>Submit this form and our CRM team will respond quickly with project details.</p>" +
      "<form class=\"lead-form\" action=\"https://formspree.io/f/mvzwwgvw\" method=\"POST\">" +
      "<input type=\"hidden\" name=\"lead_source\" value=\"RushIn Estates\">" +
      "<input type=\"hidden\" name=\"crm_stage\" value=\"New Estate Lead\">" +
      "<input type=\"hidden\" name=\"property_id\" value=\"" + property.id + "\">" +
      "<input type=\"hidden\" name=\"property_title\" value=\"" + escapeHtml(property.title) + "\">" +
      "<input type=\"text\" name=\"name\" placeholder=\"Your Name\" required>" +
      "<input type=\"email\" name=\"email\" placeholder=\"Email Address\" required>" +
      "<input type=\"tel\" name=\"phone\" placeholder=\"Phone Number\" required>" +
      "<textarea name=\"message\" rows=\"4\" placeholder=\"Tell us your budget and preferred timeline\" required></textarea>" +
      "<button class=\"btn btn-primary\" type=\"submit\">Send Inquiry</button>" +
      "</form>" +
      "</section>" +
      "</div>" +
      "</div>";
  }

  formatDate();

  loadProperties()
    .then(function (properties) {
      renderFeatured(properties);
      renderInvestment(properties);
      renderListing(properties);
      setupFilters(properties);
      renderDetails(properties);
    })
    .catch(function () {
      var targets = ["featuredProperties", "investmentOpportunities", "propertyListing", "propertyDetails"];
      targets.forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.innerHTML = "<p class=\"notice\">Unable to load properties right now. Please try again later.</p>";
      });

      var resultMeta = document.getElementById("resultMeta");
      if (resultMeta) {
        resultMeta.textContent = "0 properties found";
      }
    });
})();
