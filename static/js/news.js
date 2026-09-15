document.addEventListener('DOMContentLoaded', function() {
    const postCards = document.querySelectorAll('.post-card');

    postCards.forEach(function(card) {
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s ease';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transition = 'all 0.3s ease';
        });
    });

    const videos = document.querySelectorAll('.post-video');

    videos.forEach(function(video) {
        video.addEventListener('play', function() {
            videos.forEach(function(otherVideo) {
                if (otherVideo !== video && !otherVideo.paused) {
                    otherVideo.pause();
                }
            });
        });
    });
});
