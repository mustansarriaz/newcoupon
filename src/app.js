//Get current domain
var domain = window.location?.hostname || "";
domain = domain
  .replace("http://", "")
  .replace("https://", "")
  .replace("www.", "");
if (domain) domain = domain.split(/[/?#]/)[0];
window.domain = domain;

chrome.runtime.sendMessage(
  { command: "fetch", data: { domain: domain } },
  (response) => {
    parseCoupons(response.data, domain);
  }
);

var submitCoupon = function (couponData, domain) {
  console.log("submit coupon", { code: couponData, domain: domain });
  chrome.runtime.sendMessage(
    { command: "post", data: { coupon: couponData, domain: domain } },
    (response) => {
      submitCoupon_callback(response.data, domain);
    }
  );
};
var submitCoupon_callback = function (resp, domain) {
  console.log("Resp:", resp);
  document.querySelector("._submit-overlay").style.display = "none";
  alert("Coupon Submitted!");
};

var parseCoupons = function (coupons, domain) {
  try {
    var couponHTML = "";
    for (var key in coupons) {
      var coupon = coupons[key];
      //coupons.forEach(function(coupon, index){
      if (coupon.live) {
        couponHTML += `<li><span class="code">${coupon.code}</span>
          ${
            coupon?.start && coupon?.end
              ? `<p>Start: ${coupon.start} - End: ${coupon.end}</p>`
              : ""
          }
          <p>→ ${coupon.description}</p></li>`;
      }
    }
    if (couponHTML == "") {
      couponHTML = "<p>Be the first to submit a coupon for this site</p>";
    }
    var couponDisplay = document.createElement("div");
    couponDisplay.className = "_coupon__list";
    couponDisplay.innerHTML =
      '<div class="submit-button">Submit Coupon</div>' +
      "<h1>Coupons</h1><p>Browse coupons below that have been used for <strong>" +
      domain +
      "</strong></p>" +
      '<p style="font-style:italic;">Click any coupon to copy &amp; use</p>' +
      "<ul>" +
      couponHTML +
      "</ul>";
    couponDisplay.style.display = "none";
    document.body.appendChild(couponDisplay);

    var couponButton = document.createElement("div");
    couponButton.className = "_coupon__button";
    couponButton.innerHTML = "C";
    document.body.appendChild(couponButton);

    var couponSubmitOverlay = document.createElement("div");
    couponSubmitOverlay.className = "_submit-overlay";
    couponSubmitOverlay.innerHTML = `<div class="overlay_contents"><span class="close">(x) close</span>
      <h3>Do you have a coupon for this site?</h3>
      <div><label>Admin Code:</label><input type="text" class="admin-code"/></div>
      <div><label>Site:</label><input type="text" value="${window.location.hostname}" class="site"/></div>
      <div><label>Code:</label><input type="text" class="code"/></div>
      <div><label>Description:</label><input type="text" class="desc"/></div>
      <div><label>Start:</label><input type="date" class="start"/></div>
      <div><label>End:</label><input type="date" class="end"/></div>
      <div><label>Enabled:</label><input type="checkbox" class="enabled" value="1" checked /></div>
      <div><button class="submit-coupon">Submit Coupon</button></div></div>`;
    couponSubmitOverlay.style.display = "none";
    document.body.appendChild(couponSubmitOverlay);

    createEvents();
  } catch (e) {
    console.log("no coupons found for this domain", e);
  }
};

var copyToClipboard = function (str) {
  var input = document.createElement("textarea");
  input.innerHTML = str;
  document.body.appendChild(input);
  input.select();
  var result = document.execCommand("copy");
  document.body.removeChild(input);
  alert("Copied to clipboard: " + str);
  return result;
};

var createEvents = function () {
  document.querySelectorAll("._coupon__list .code").forEach((codeItem) => {
    codeItem.addEventListener("click", (event) => {
      var codeStr = codeItem.innerHTML;
      copyToClipboard(codeStr);
    });
  });

  document
    .querySelector("._submit-overlay .close")
    .addEventListener("click", function (event) {
      document.querySelector("._submit-overlay").style.display = "none";
    });

  document
    .querySelector("._coupon__list .submit-button")
    .addEventListener("click", function (event) {
      document.querySelector("._submit-overlay").style.display = "flex";
    });

  document
    .querySelector("._submit-overlay  .submit-coupon")
    .addEventListener("click", function (event) {
      // check admin code
      var adminCode = document.querySelector(
        "._submit-overlay .admin-code"
      ).value;

      var code = document.querySelector("._submit-overlay .code").value;
      var desc = document.querySelector("._submit-overlay .desc").value;
      var start = document.querySelector("._submit-overlay .start").value;
      var end = document.querySelector("._submit-overlay .end").value;
      var site = document.querySelector("._submit-overlay .site").value;
      var isChecked = document.querySelector(
        "._submit-overlay .enabled"
      ).checked;

      if (
        adminCode !== "admin" ||
        adminCode === "" ||
        code === "" ||
        desc === "" ||
        start === "" ||
        end === "" ||
        site === ""
      ) {
        alert("Invalid data provided");
        return;
      }

      var couponData = {
        code: code,
        description: desc,
        start: start,
        end: end,
        name: site,
        live: isChecked,
      };
      submitCoupon(couponData, window.domain);
    });

  document
    .querySelector("._coupon__button")
    .addEventListener("click", function (event) {
      if (document.querySelector("._coupon__list").style.display == "block") {
        document.querySelector("._coupon__list").style.display = "none";
      } else {
        document.querySelector("._coupon__list").style.display = "block";
      }
    });
};
