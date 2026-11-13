
import React, { useEffect, useState } from "react";
import "./ProductDetails.css";

import {
  doc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  deleteDoc,
  runTransaction,
} from "firebase/firestore";

import { db, auth } from "../firebase";

const getUserName = async (user) => {
  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      return userData.name || user.displayName || "Student";
    }

    return user.displayName || "Student";
  } catch (error) {
    console.error("User name error:", error);
    return user.displayName || "Student";
  }
};

function ProductDetails({ productId, setPage, addToCart }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userReaction, setUserReaction] = useState(null);
  const [reactionLoading, setReactionLoading] = useState(false);

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [reviewLoading, setReviewLoading] = useState(false);

  // Fetch Product and User Reaction
  useEffect(() => {
    let active = true;

    const fetchProduct = async () => {
      setLoading(true);

      try {
        const productRef = doc(db, "products", productId);
        const productSnap = await getDoc(productRef);

        if (!active) return;

        if (productSnap.exists()) {
          const productData = productSnap.data();

          setProduct({
            id: productSnap.id,
            ...productData,
          });

          setLikes(Number(productData.likes || 0));
          setDislikes(Number(productData.dislikes || 0));

          const user = auth.currentUser;

          if (user) {
            const wishlistRef = doc(
              db,
              "users",
              user.uid,
              "wishlist",
              productId
            );

            const voteRef = doc(
              db,
              "products",
              productId,
              "votes",
              user.uid
            );

            const [wishlistSnap, voteSnap] = await Promise.all([
              getDoc(wishlistRef),
              getDoc(voteRef),
            ]);

            if (active) {
              setIsWishlisted(wishlistSnap.exists());

              if (voteSnap.exists()) {
                setUserReaction(voteSnap.data().reaction || null);
              } else {
                setUserReaction(null);
              }
            }
          } else {
            setIsWishlisted(false);
            setUserReaction(null);
          }
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error("Product loading error:", error);

        if (active) {
          alert("Could not load product: " + error.message);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }

    return () => {
      active = false;
    };
  }, [productId]);

  // Fetch Comments
  useEffect(() => {
    let active = true;

    const fetchComments = async () => {
      if (!productId) return;

      try {
        const commentsRef = collection(
          db,
          "products",
          productId,
          "comments"
        );

        const commentsSnap = await getDocs(commentsRef);

        const commentList = commentsSnap.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        if (active) setComments(commentList);
      } catch (error) {
        console.error("Comments loading error:", error);
      }
    };

    fetchComments();

    return () => {
      active = false;
    };
  }, [productId]);

  // Fetch Reviews
  useEffect(() => {
    let active = true;

    const fetchReviews = async () => {
      if (!productId) return;

      try {
        const reviewsRef = collection(
          db,
          "products",
          productId,
          "reviews"
        );

        const reviewsSnap = await getDocs(reviewsRef);

        const reviewList = reviewsSnap.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        if (active) setReviews(reviewList);
      } catch (error) {
        console.error("Reviews loading error:", error);
      }
    };

    fetchReviews();

    return () => {
      active = false;
    };
  }, [productId]);

  // Add Comment
  const handleAddComment = async () => {
    const user = auth.currentUser;

    if (!user) {
      alert("Please login first!");
      return;
    }

    if (!commentText.trim()) {
      alert("Please write a comment.");
      return;
    }

    try {
      setCommentLoading(true);

      const userName = await getUserName(user);

      const commentsRef = collection(
        db,
        "products",
        productId,
        "comments"
      );

      const newComment = {
        userId: user.uid,
        userName: userName,
        comment: commentText.trim(),
        createdAt: serverTimestamp(),
      };

      const commentDoc = await addDoc(commentsRef, newComment);

      setComments((prev) => [
        ...prev,
        {
          id: commentDoc.id,
          userId: user.uid,
          userName: userName,
          comment: newComment.comment,
          createdAt: new Date(),
        },
      ]);

      setCommentText("");
    } catch (error) {
      console.error("Add comment error:", error);
      alert("Failed to add comment: " + error.message);
    } finally {
      setCommentLoading(false);
    }
  };

  // Like / Dislike
  const handleReaction = async (reaction) => {
    const user = auth.currentUser;

    if (!user) {
      alert("Please login first!");
      return;
    }

    if (reactionLoading) return;

    try {
      setReactionLoading(true);

      const productRef = doc(db, "products", productId);

      const voteRef = doc(
        db,
        "products",
        productId,
        "votes",
        user.uid
      );

      const result = await runTransaction(db, async (transaction) => {
        const productSnap = await transaction.get(productRef);
        const voteSnap = await transaction.get(voteRef);

        if (!productSnap.exists()) {
          throw new Error("Product not found.");
        }

        const productData = productSnap.data();

        let currentLikes = Number(productData.likes || 0);
        let currentDislikes = Number(productData.dislikes || 0);

        const previousReaction = voteSnap.exists()
          ? voteSnap.data().reaction
          : null;

        let nextReaction = reaction;

        // Clicking the same reaction removes the vote
        if (previousReaction === reaction) {
          nextReaction = null;
        }

        // Remove previous reaction count
        if (previousReaction === "like") {
          currentLikes = Math.max(0, currentLikes - 1);
        } else if (previousReaction === "dislike") {
          currentDislikes = Math.max(0, currentDislikes - 1);
        }

        // Add new reaction count
        if (nextReaction === "like") {
          currentLikes += 1;
        } else if (nextReaction === "dislike") {
          currentDislikes += 1;
        }

        transaction.update(productRef, {
          likes: currentLikes,
          dislikes: currentDislikes,
        });

        if (nextReaction === null) {
          if (voteSnap.exists()) {
            transaction.delete(voteRef);
          }
        } else {
          transaction.set(voteRef, {
            userId: user.uid,
            reaction: nextReaction,
            updatedAt: serverTimestamp(),
          });
        }

        return {
          likes: currentLikes,
          dislikes: currentDislikes,
          reaction: nextReaction,
        };
      });

      setLikes(result.likes);
      setDislikes(result.dislikes);
      setUserReaction(result.reaction);
    } catch (error) {
      console.error("Reaction error:", error);
      alert("Failed to react: " + error.message);
    } finally {
      setReactionLoading(false);
    }
  };

  const handleLike = () => handleReaction("like");
  const handleDislike = () => handleReaction("dislike");

  // Wishlist
  const handleWishlist = async () => {
    const user = auth.currentUser;

    if (!user) {
      alert("Please login first!");
      return;
    }

    if (wishlistLoading) return;

    try {
      setWishlistLoading(true);

      const wishlistRef = doc(
        db,
        "users",
        user.uid,
        "wishlist",
        productId
      );

      if (isWishlisted) {
        await deleteDoc(wishlistRef);
        setIsWishlisted(false);
        alert("Removed from Wishlist!");
      } else {
        await setDoc(wishlistRef, {
          productId: productId,
          productName: product.productName || "Product",
          price: Number(product.price || 0),
          category: product.category || "",
          image: product.image || "",
          sellerName: product.sellerName || "Seller",
          createdAt: serverTimestamp(),
        });

        setIsWishlisted(true);
        alert("Added to Wishlist successfully!");
      }
    } catch (error) {
      console.error("Wishlist error:", error);
      alert("Wishlist error: " + error.message);
    } finally {
      setWishlistLoading(false);
    }
  };

  // Add Review
  const handleAddReview = async () => {
    const user = auth.currentUser;

    if (!user) {
      alert("Please login first!");
      return;
    }

    if (rating === 0) {
      alert("Please select a rating.");
      return;
    }

    if (!reviewText.trim()) {
      alert("Please write a review.");
      return;
    }

    try {
      setReviewLoading(true);

      const userName = await getUserName(user);

      const reviewsRef = collection(
        db,
        "products",
        productId,
        "reviews"
      );

      const newReview = {
        userId: user.uid,
        userName: userName,
        rating: Number(rating),
        review: reviewText.trim(),
        createdAt: serverTimestamp(),
      };

      const reviewDoc = await addDoc(reviewsRef, newReview);

      setReviews((prev) => [
        ...prev,
        {
          id: reviewDoc.id,
          userId: user.uid,
          userName: userName,
          rating: Number(rating),
          review: newReview.review,
          createdAt: new Date(),
        },
      ]);

      setRating(0);
      setReviewText("");

      alert("Review added successfully!");
    } catch (error) {
      console.error("Add review error:", error);
      alert("Failed to add review: " + error.message);
    } finally {
      setReviewLoading(false);
    }
  };

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce(
            (sum, item) => sum + Number(item.rating || 0),
            0
          ) / reviews.length
        ).toFixed(1)
      : "0.0";

  if (loading) {
    return (
      <div className="product-details-page">
        <div className="details-message">
          <h3>Loading product...</h3>
          <p>Please wait.</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-details-page">
        <div className="details-message">
          <h3>Product not found</h3>
          <button onClick={() => setPage("home")}>
            ← Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const handleContactSeller = () => {
    if (product.phone) {
      window.location.href = `tel:${product.phone}`;
    } else {
      alert("Seller phone number is not available.");
    }
  };

  return (
    <div className="product-details-page">
      <button
        className="back-button"
        onClick={() => setPage("home")}
      >
        ← Back to Marketplace
      </button>

      <div className="details-container">
        <div className="details-image">
          <img
            src={product.image || ""}
            alt={product.productName || "Product"}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>

        <div className="details-info">
          <span className="details-category">
            {product.category}
          </span>

          <h1>{product.productName}</h1>

          <div className="details-price">
            ৳{product.price}
          </div>

          <div className="details-divider"></div>

          <div className="details-row">
            <span>Condition</span>
            <strong>{product.condition || "Not specified"}</strong>
          </div>

          <div className="details-row">
            <span>Location</span>
            <strong>{product.location || "Not specified"}</strong>
          </div>

          <div className="details-row">
            <span>Seller</span>
            <strong>{product.sellerName || "Seller"}</strong>
          </div>

          <div className="details-row">
            <span>Phone</span>
            <strong>
              {product.phone ? (
                <a href={`tel:${product.phone}`} className="phone-link">
                  {product.phone}
                </a>
              ) : (
                "Not available"
              )}
            </strong>
          </div>

          <div className="details-divider"></div>

          <h3>Description</h3>

          <p className="details-description">
            {product.description}
          </p>

          <button
            onClick={() => {
              if (addToCart) {
                addToCart(product.id);
              } else {
                alert("Cart function is not available.");
              }
            }}
            style={{
              width: "100%",
              padding: "13px",
              marginTop: "15px",
              marginBottom: "10px",
              border: "none",
              borderRadius: "8px",
              background: "#059669",
              color: "white",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            🛒 Add to Cart
          </button>

          <button
            className={`wishlist-button ${
              isWishlisted ? "wishlisted" : ""
            }`}
            onClick={handleWishlist}
            disabled={wishlistLoading}
          >
            {wishlistLoading
              ? "Please wait..."
              : isWishlisted
              ? "❤️ Saved to Wishlist"
              : "♡ Add to Wishlist"}
          </button>

          <button
            className="contact-details-button"
            onClick={handleContactSeller}
          >
            📞 Contact Seller
          </button>
        </div>
      </div>

      {/* Comments and Reactions */}
      <div className="comments-wrapper">
        <div className="comments-section">
          <h2>💬 Comments</h2>

          <div className="comment-form">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write your comment..."
              rows="4"
            />

            <button
              onClick={handleAddComment}
              disabled={commentLoading}
            >
              {commentLoading ? "Posting..." : "Post Comment"}
            </button>
          </div>

          <div className="comment-list">
            {comments.length === 0 ? (
              <p className="no-comments">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              comments.map((item) => (
                <div className="comment-item" key={item.id}>
                  <strong>{item.userName}</strong>
                  <p>{item.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="reaction-box">
          <h3>Product Reaction</h3>

          <button
            className="reaction-like"
            onClick={handleLike}
            disabled={reactionLoading}
            style={{
              background: userReaction === "like" ? "#bbf7d0" : "",
              border: userReaction === "like" ? "2px solid #16a34a" : "",
            }}
          >
            👍 Like <span>{likes}</span>
            {userReaction === "like" ? " ✓" : ""}
          </button>

          <button
            className="reaction-dislike"
            onClick={handleDislike}
            disabled={reactionLoading}
            style={{
              background: userReaction === "dislike" ? "#fecaca" : "",
              border: userReaction === "dislike" ? "2px solid #dc2626" : "",
            }}
          >
            👎 Dislike <span>{dislikes}</span>
            {userReaction === "dislike" ? " ✓" : ""}
          </button>
        </div>
      </div>

      {/* Reviews */}
      <div className="reviews-section">
        <div className="reviews-header">
          <div>
            <h2>⭐ Reviews & Ratings</h2>
            <p>
              Average Rating: <strong>{averageRating}</strong> / 5
            </p>
          </div>

          <div className="average-stars">
            {"★".repeat(Math.round(Number(averageRating)))}
            {"☆".repeat(5 - Math.round(Number(averageRating)))}
          </div>
        </div>

        <div className="review-form">
          <h3>Give Your Review</h3>

          <div className="star-selection">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={star <= rating ? "star active" : "star"}
                onClick={() => setRating(star)}
              >
                ★
              </button>
            ))}
          </div>

          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Write your review..."
            rows="4"
          />

          <button
            className="review-submit-button"
            onClick={handleAddReview}
            disabled={reviewLoading}
          >
            {reviewLoading ? "Submitting..." : "Submit Review"}
          </button>
        </div>

        <div className="review-list">
          {reviews.length === 0 ? (
            <p className="no-reviews">
              No reviews yet. Be the first to review this product!
            </p>
          ) : (
            reviews.map((item) => (
              <div className="review-item" key={item.id}>
                <div className="review-top">
                  <strong>{item.userName}</strong>

                  <span className="review-stars">
                    {"★".repeat(Number(item.rating))}
                    {"☆".repeat(5 - Number(item.rating))}
                  </span>
                </div>

                <p>{item.review}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
